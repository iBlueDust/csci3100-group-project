import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import mongoose from 'mongoose'

import env from '@/env'
import minioClient, { putManyObjects } from '@/data/db/minio'
import dbConnect from '@/data/db/mongo'
import MarketListing from '@/data/db/mongo/models/market-listing'
import { makeMarketListingClientFriendly, type MarketListingSearchResult } from '@/data/db/mongo/queries/market'
import { getMarketListingById } from '@/data/db/mongo/queries/market/getMarketListingById'
import type { Error as ApiError } from '@/data/types/common'
import { sessionStore } from '@/data/session'
import { assertIsObjectId, parseFormDataBody, File } from '@/utils/api'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import {
	generatePictureObjectName,
	isSupportedMimeType,
	patchPictureArrayAllUnique,
	patchPictureArrayUnusedPictures,
	patchPictureArrayWithinBounds
} from '@/utils/api/market'


type GetData = MarketListingSearchResult
type PatchData = MarketListingSearchResult
type DeleteData = { success: boolean }

async function GET(
	req: NextApiRequest,
	res: NextApiResponse<GetData | ApiError>,
) {
	const { value: id, error } = Joi.string().required().validate(req.query.id)

	if (error) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
		return
	}

	let listingId: mongoose.Types.ObjectId
	try {
		listingId = new mongoose.Types.ObjectId(id)
	} catch {
		return res
			.status(400)
			.json({ code: 'INVALID_REQUEST', message: 'Invalid market listing ID' })
	}

	await dbConnect()
	const listing = await getMarketListingById(listingId)
	if (!listing) {
		return res
			.status(404)
			.json({ code: 'NOT_FOUND', message: 'Market listing not found' })
	}

	listing.pictures = listing.pictures.map(
		(picture: string) =>
			`${env.MINIO_PUBLIC_ENDPOINT}/`
			+ `${env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS}/`
			+ `${picture.toString()}`
	)

	res.status(200).json(listing)
}

async function PATCH(
	req: NextApiRequest,
	res: NextApiResponse<PatchData | ApiError>,
	auth: AuthData,
) {
	const { value: listingId, error: listingIdError } =
		Joi.custom(assertIsObjectId).required().validate(req.query.id)

	if (listingIdError) {
		res.status(400)
			.json({ code: 'INVALID_REQUEST', message: listingIdError.message })
		return
	}

	const { fields, error: parseError } = await parseFormDataBody(req, {
		maxFileSize: env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT,
		filter: (part) => !!part.mimetype && isSupportedMimeType(part.mimetype),
	})

	if (parseError) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: parseError.toString() })
		return
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
			.optional(),
		description: Joi.string()
			.pattern(
				new RegExp(
					`^\\s*\\S.{0,${env.MARKET_LISTING_DESCRIPTION_MAX_LENGTH - 1}}\\s*$`
				)
			)
			.optional(),
		pictures: Joi.array()
			.items(
				Joi.alternatives().try(
					Joi.number().integer().required(),
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
					}),
				)
			).optional(),
		priceInCents: Joi.number().min(0).integer().optional(),
		countries: Joi.array()
			.items(Joi.string().pattern(/^[a-zA-Z]{2}$/))
			.optional(),
	})

	const validation = schema.validate({
		title: fields?.title?.[0],
		description: fields?.description?.[0],
		pictures: fields?.pictures,
		priceInCents: fields?.priceInCents?.[0],
		countries: fields?.countries,
	})
	if (validation.error) {
		res.status(400)
			.json({ code: 'INVALID_REQUEST', message: validation.error.message })
		return
	}

	const body = validation.value as {
		title?: string
		description?: string
		pictures?: (number | File)[]
		priceInCents?: number
		countries?: string[]
	}
	console.log({ body })

	const listing = await MarketListing.findOne({
		_id: listingId,
		author: auth.data.userId,
	}).populate('author', 'username')
	if (!listing) {
		res.status(404)
			.json({ code: 'NOT_FOUND', message: 'Market listing not found' })
		return
	}

	// validate `pictures`
	if (body.pictures) {
		const numOldPics = listing.pictures.length
		const patchPictureArray = body.pictures
			.filter((picture) => typeof picture === 'number')

		if (!patchPictureArrayWithinBounds(patchPictureArray, numOldPics)) {
			res.status(400).json({
				code: 'INVALID_REQUEST',
				message: 'Picture index out of bounds',
			})
			return
		}

		if (!patchPictureArrayAllUnique(patchPictureArray, numOldPics)) {
			res.status(400)
				.json({ code: 'INVALID_REQUEST', message: 'Duplicate picture index' })
			return
		}

		const newPictures: File[] = body.pictures
			.filter((picture) => typeof picture === 'object')
		const newPictureObjectNames =
			newPictures?.map(generatePictureObjectName) ?? []

		const uploadedAt = new Date().toISOString()
		const uploadResults = await putManyObjects(
			minioClient,
			env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS,
			newPictures?.map(({ data, filename, mimetype }, index: number) => {
				const objectName = newPictureObjectNames[index]
				return {
					name: objectName,
					data,
					maxSize: env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT,
					metadata: {
						originalFilename: filename,
						mimetype,
						listingId: listingId.toString(),
						uploadedAt,
						uploadedBy: auth.data.userId,
					},
				}
			}) ?? [],
		)

		if (!uploadResults.success) {
			console.warn(`PATCH /market/listings/${listingId} | Error uploading pictures:`, uploadResults.failedObjects)

			res.status(500).json({
				code: 'SERVER_ERROR',
				message: 'Error uploading pictures',
			})
			return
		}

		// Delete pictures that are now unused
		const picturesToDelete = patchPictureArrayUnusedPictures(
			patchPictureArray, numOldPics
		).filter(index => index >= 0)
			.map((index) => listing.pictures[index])
		console.log(`PATCH /market/listings/${listingId} | Deleting unused pictures:`, picturesToDelete)
		await Promise.all(
			picturesToDelete.map((objectName) =>
				minioClient
					.removeObject(env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS, objectName)
			)
		).catch((err) => {
			console.error('PATCH /market/listings | Error deleting pictures:', err)
		})

		const newPictureArray: string[] = []
		for (const value of body.pictures) {
			if (typeof value === 'number') {
				newPictureArray.push(listing.pictures[value])
			} else {
				const picture = newPictureObjectNames.shift()
				if (!picture) {
					throw new Error('Unexpected error: no more picture object names')
				}
				newPictureArray.push(picture)
			}
		}
		listing.pictures = newPictureArray
	}
	if (body.title) listing.title = body.title.trim()
	if (body.description) listing.description = body.description.trim()
	if (body.priceInCents) listing.priceInCents = body.priceInCents
	if (body.countries) listing.countries = body.countries
	listing.editedAt = new Date()

	await listing.save()

	const listingJson = makeMarketListingClientFriendly(listing.toJSON())
	listingJson.pictures = listingJson.pictures.map(picture =>
		`${env.MINIO_PUBLIC_ENDPOINT}/`
		+ `${env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS}/`
		+ `${picture.toString()}`
	)

	res.status(200).json(listingJson)
}

async function DELETE(
	req: NextApiRequest,
	res: NextApiResponse<DeleteData | ApiError>,
	auth: AuthData,
) {
	const { value: id, error } = Joi.string().required().validate(req.query.id)

	if (error) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
		return
	}

	let listingId: mongoose.Types.ObjectId
	try {
		listingId = new mongoose.Types.ObjectId(id)
	} catch {
		return res
			.status(400)
			.json({ code: 'INVALID_REQUEST', message: 'Invalid market listing ID' })
	}

	await dbConnect()

	const result = await MarketListing.deleteOne({
		_id: listingId,
		author: auth.data.userId,
	})
	if (result.deletedCount === 0) {
		return res
			.status(404)
			.json({ code: 'NOT_FOUND', message: 'Market listing not found' })
	}

	return res.status(200).json({ success: result.deletedCount > 0 })
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<GetData | ApiError>,
) {
	switch (req.method) {
		case 'GET':
			return await GET(req, res)
		case 'PATCH':
			return await protectedRoute(PATCH, sessionStore)(req, res)
		case 'DELETE':
			return await protectedRoute(DELETE, sessionStore)(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}

export const config = {
	api: {
		bodyParser: false,
	},
}