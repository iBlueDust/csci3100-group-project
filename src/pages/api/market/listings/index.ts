import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import { v4 as uuid } from 'uuid'
import type formidable from 'formidable'

import MarketListing from '@/data/db/mongo/models/market-listing'
import dbConnect from '@/data/db/mongo'
import { Error as ApiError, PaginatedResult } from '@/data/types/common'
import { MarketListingSearchResult, searchMarketListings } from '@/data/db/mongo/queries/market/searchMarketListings'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import { sessionStore } from '@/data/session'
import minioClient from '@/data/db/minio'
import { parseFormDataBody } from '@/utils/api'
import env from '@/env'

type GetData = PaginatedResult<MarketListingSearchResult>

async function GET(
	req: NextApiRequest,
	res: NextApiResponse<GetData | ApiError>,
) {
	const schema = Joi.object({
		query: Joi.string().optional(),
		countries: Joi.string().optional(),
		priceMin: Joi.number().min(0).optional(),
		priceMax: Joi.when(
			Joi.ref('priceMin'),
			{
				is: Joi.exist(),
				then: Joi.number().greater(Joi.ref('priceMin')),
				otherwise: Joi.allow(null),
			}
		).optional(),
		skip: Joi.number().min(0).default(0),
		limit: Joi.number().min(1).max(100).default(30),
	})
	const { value: options, error } = schema.validate(req.query)

	if (error) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
		return
	}

	await dbConnect()
	const listings = await searchMarketListings({
		...options,
		countries: options.countries?.toLowerCase()
			.split(',')
			.map((country: string) => country.trim()),
	})

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

export const mimeTypeToExtension = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/gif': 'gif',
	'image/webp': 'webp',
} as Record<string, string>

export const isSupportedMimeType = (mimeType: string) =>
	!!mimeTypeToExtension[mimeType]


type PostData = { id: string }

async function POST(
	req: NextApiRequest,
	res: NextApiResponse<PostData | ApiError>,
	auth: AuthData,
) {
	const { fields, files, error } = await parseFormDataBody(
		req,
		{ maxFileSize: env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT },
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
		pictures: files?.pictures,
		priceInCents: tryParseInt(fields?.priceInCents?.[0]),
		countries: fields?.countries,
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
					`^\\s*\\S.{0,${env.MARKET_LISTING_DESCRIPTION_MAX_LENGTH - 1}}\\s*$`
				)
			)
			.required(),
		pictures: Joi.array()
			.items(
				Joi.object({
					data: Joi.binary()
						.max(env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT)
						.required(),
					info: Joi
						.custom(value => {
							if (typeof value.toJSON !== 'function') return false

							const info = (value as formidable.File).toJSON()
							if (info.size > env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT) {
								const limitInKib = env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT / 1024
								throw new Error(`File size exceeds ${limitInKib} KiB`)
							}
							if (!info.mimetype || !isSupportedMimeType(info.mimetype)) {
								throw new Error(`Unsupported file type: ${info.mimetype}`)
							}

							return value
						}
						)
						.required(),
				})
			)
			.max(env.MARKET_LISTING_ATTACHMENT_LIMIT)
			.default([]),
		priceInCents: Joi.number().min(0).integer().required(),
		countries: Joi.array().items(Joi.string().pattern(/^[a-zA-Z]{2}$/)).default([]),
	})

	const { value: body, error: validationError } = schema.validate(unvalidatedBody)

	if (validationError) {
		console.warn('POST /market/listings | Rejected request for invalid body:', validationError)
		res.status(400).json({ code: 'INVALID_REQUEST', message: validationError.message })
		return
	}

	const filesToUpload =
		(body.pictures as NonNullable<typeof files>[string]).map(({ data, info }) => {
			const extension = mimeTypeToExtension[info.mimetype!] ?? info.originalFilename?.split('.').pop()
			const objectName = `${uuid()}.${extension}`
			console.log(`POST /market/listings | Uploading picture: info=${info.toJSON()}, extension=${extension}, target=${objectName}`)
			return { objectName, data }
		})

	const uploadResults = await Promise.allSettled(
		filesToUpload
			.map(async ({ data, objectName }) =>
				minioClient.putObject(
					env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS,
					objectName,
					data,
					env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT,
				)
			)
	)

	if (uploadResults.some(result => result.status === 'rejected')) {
		console.warn('POST /market/listings | Error uploading pictures:', uploadResults)

		// Delete all successfully uploaded pictures in **background**
		uploadResults.forEach((result, index) => {
			if (result.status !== 'fulfilled') return

			const [filename,] = body.pictures[index]
			minioClient
				.removeObject(env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS, filename)
				.catch(err => {
					console.warn('POST /market/listings | (Upload failure cleanup) Error deleting picture:', err)
				})
		})

		return res.status(500).json({ code: 'SERVER_ERROR', message: 'Error uploading pictures' })
	}

	await dbConnect()
	const listing = await MarketListing.create({
		title: body.title,
		description: body.description,
		pictures: filesToUpload.map(({ objectName }) => objectName),
		author: auth.data.userId,
		priceInCents: body.priceInCents,
		countries: body.countries,
	})

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