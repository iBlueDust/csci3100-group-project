import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'

import MarketListing from '@/data/db/mongo/models/market-listing'
import dbConnect from '@/data/db/mongo'
import { Error as ApiError, PaginatedResult } from '@/data/types/common'
import type { MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { searchMarketListings } from '@/data/db/mongo/queries/market/searchMarketListings'
import { sessionStore } from '@/data/session'
import minioClient, { putManyObjects } from '@/data/db/minio'
import { isSupportedImageMimeType } from '@/utils'
import { parseFormDataBody, File, generateMinioObjectName, assertIsObjectId } from '@/utils/api'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import env from '@/env'

type GetData = PaginatedResult<MarketListingSearchResult>

async function GET(
	req: NextApiRequest,
	res: NextApiResponse<GetData | ApiError>,
) {
	const schema = Joi.object({
		query: Joi.string().optional(),
		priceMin: Joi.number().min(0).optional(),
		priceMax: Joi.when(
			Joi.ref('priceMin'),
			{
				is: Joi.exist(),
				then: Joi.number().greater(Joi.ref('priceMin')),
				otherwise: Joi.number().min(0).optional(),
			}
		).optional(),
		countries: Joi.array().items(Joi.string().required()).optional(),
		categories: Joi.array().items(Joi.string().pattern(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/)).optional(),
		author: Joi.string().custom(assertIsObjectId).optional(),
		sort: Joi.string().allow('listedAt-desc', 'price-desc', 'price-asc').default('listedAt-desc'),
		skip: Joi.number().min(0).default(0),
		limit: Joi.number().min(1).max(100).default(30),
	})
	// parse and normalize countries parameter
	const countriesRaw = req.query.countries
		? Array.isArray(req.query.countries)
			? req.query.countries
			: (req.query.countries as string).split(',')
		: undefined
	const categoriesRaw = req.query.categories
		? Array.isArray(req.query.categories)
			? req.query.categories
			: (req.query.categories as string).split(',')
		: undefined
	console.log({ reqQuery: req.query })
	const countries = countriesRaw?.map(country => country.trim().toLowerCase())
	const categories = categoriesRaw?.map(category => category.trim().toLowerCase())

	const { value: options, error } = schema.validate({
		...req.query,
		countries,
		categories,
	})

	if (error) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
		return
	}
	console.log('GET /market/listings | options:', options)
	await dbConnect()
	const listings = await searchMarketListings(options)

	for (const listing of listings.data) {
		listing.pictures = listing.pictures.map(
			(pictureObjectName: string) =>
				`${env.MINIO_PUBLIC_ENDPOINT || 'localhost:9000'}/`
				+ `${env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS}/`
				+ `${pictureObjectName.toString()}`
		)
	}

	res.status(200).json(listings)
}

type PostData = { id: string }

async function POST(
	req: NextApiRequest,
	res: NextApiResponse<PostData | ApiError>,
	auth: AuthData,
) {
	const { fields, error } = await parseFormDataBody(
		req,
		{
			maxFileSize: env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT,
			filter: part => !!part.mimetype && isSupportedImageMimeType(part.mimetype),
		},
	)

	if (error) {
		console.warn('POST /market/listings | Error parsing form data:', error)
		res.status(400).json({ code: 'INVALID_REQUEST', message: 'Invalid form data' })
		return
	}

	const tryParseInt = (value: unknown) =>
		['string', 'number'].includes(typeof value) ? parseInt(value as string) : null
	const unvalidatedBody = {
		title: fields?.title?.[0],
		description: fields?.description?.[0],
		pictures: fields?.pictures,
		priceInCents: tryParseInt(fields?.priceInCents?.[0]),
		countries: fields?.countries,
		categories: fields?.categories,
	}

	const schema = Joi.object({
		// title must contain at least one non-whitespace character and be at most 
		// 200 characters long (after trimming)
		title: Joi.string()
			.pattern(
				new RegExp(
					`^\\s*\\S.{0,${env.MARKET_LISTING_TITLE_MAX_LENGTH - 1}}\\s*$`
				)
			)
			.required(),
		description: Joi.string()
			.pattern(
				new RegExp(
					`^\\s*\\S.{0,${env.MARKET_LISTING_DESCRIPTION_MAX_LENGTH - 1}}\\s*$`,
					'm',
				)
			)
			.optional(),
		pictures: Joi.array()
			.items(
				Joi.object({
					data: Joi.binary()
						.max(env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT)
						.required(),
					size: Joi.number()
						.max(env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT)
						.required(),
					filename: Joi.string().required(),
					mimetype: Joi.string(),
					encoding: Joi.string(),
				})
			)
			.max(env.MARKET_LISTING_ATTACHMENT_LIMIT)
			.default([]),
		priceInCents: Joi.number().min(0).integer().required(),
		countries: Joi.array()
			.items(Joi.string().pattern(/^[a-zA-Z]{2}$/).lowercase())
			.default([]),
		categories: Joi.array()
			.items(Joi.string().required())
			.default([]),
	})

	const validation = schema.validate(unvalidatedBody)

	if (validation.error) {
		console.warn('POST /market/listings | Rejected request for invalid body:', validation.error)
		res.status(400)
			.json({ code: 'INVALID_REQUEST', message: validation.error.message })
		return
	}

	const body = validation.value as {
		title: string
		description: string
		pictures: File[]
		priceInCents: number
		countries: string[]
		categories: string[]
	}

	const filesToUpload = body.pictures.map((picture) => ({
		...picture,
		objectName: generateMinioObjectName(picture),
	}))
	filesToUpload.forEach(({ objectName, size, filename, mimetype, encoding }) => {
		console.log(`POST /market/listings | Uploading picture: target=${objectName} size=${size} filename=${filename} mimetype=${mimetype} encoding=${encoding}`)
	})

	const uploadedAt = new Date().toISOString()
	const minioObjects = filesToUpload.map(({ objectName, data, filename, mimetype }) => ({
		name: objectName,
		data,
		maxSize: env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT,
		metadata: {
			originalFilename: filename,
			mimetype,
			uploadedAt,
			uploadedBy: auth.data.userId,
		}
	}))
	const uploadResults = await putManyObjects(
		minioClient,
		env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS,
		minioObjects,
	)

	if (!uploadResults.success) {
		console.warn('POST /market/listings | Error uploading pictures:', uploadResults.failedObjects)

		return res.status(500).json({ code: 'SERVER_ERROR', message: 'Error uploading pictures' })
	}

	await dbConnect()
	const listing = new MarketListing({
		title: body.title,
		description: body.description,
		pictures: filesToUpload.map(({ objectName }) => objectName),
		author: auth.data.userId,
		priceInCents: body.priceInCents,
		countries: body.countries,
		categories: body.categories ?? [],
	})
	await listing.save()

	res.status(200).json({ id: listing.id })
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<GetData | PostData | ApiError>,
) {
	switch (req.method) {
		case 'GET':
			return await GET(req, res)
		case 'POST':
			return await protectedRoute(POST, sessionStore)(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}

export const config = {
	api: {
		bodyParser: false, // for Formidable, disable default parsers (incl. json)
	}
}