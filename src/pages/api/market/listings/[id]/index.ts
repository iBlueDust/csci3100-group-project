import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import mongoose from 'mongoose'
import type formidable from 'formidable'
import { v4 as uuid } from 'uuid'

import dbConnect from '@/data/db/mongo'
import MarketListing from '@/data/db/mongo/models/market-listing'
import { Error as ApiError } from '@/data/types/common'
import { sessionStore } from '@/data/session'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import { getMarketListingById } from '@/data/db/mongo/queries/market/getMarketListingById'
import { MarketListingSearchResult } from '@/data/db/mongo/queries/market/searchMarketListings'
import { assertIsObjectId, parseFormDataBody } from '@/utils/api'
import env from '@/env'

import { isSupportedMimeType, mimeTypeToExtension } from '..'
import minioClient from '@/data/db/minio'

type GetData = { id: string }
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
			`${process.env.MINIO_PUBLIC_ENDPOINT || 'localhost:9000'}/`
			+ `${process.env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS || 'market-listing-attachments'}/`
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

	const { fields, files, error: parseError } = await parseFormDataBody(req, {
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
			.items(Joi.number().integer().required())
			.max(env.MARKET_LISTING_ATTACHMENT_LIMIT)
			.optional(),
		newPictures: Joi.array()
			.items(
				Joi.object({
					info: Joi.custom((value, helpers) => {
						if (!isSupportedMimeType(value.mimetype)) {
							return helpers.error('any.invalid')
						}
						return value
					}).required(),
					data: Joi.binary().required(),
				}),
			)
			.optional(),
		priceInCents: Joi.number().min(0).integer().optional(),
		countries: Joi.array()
			.items(Joi.string().pattern(/^[a-zA-Z]{2}$/))
			.optional(),
	})

	const { error: bodyError, value: body } = schema.validate({
		title: fields?.title?.[0],
		description: fields?.description?.[0],
		pictures: fields?.pictures,
		newPictures: files?.newPictures,
		priceInCents: fields?.priceInCents?.[0],
		countries: fields?.countries,
	})
	if (bodyError) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: bodyError.message })
		return
	}

	const listing = await MarketListing.findOne({
		_id: listingId,
		author: auth.data.userId,
	}).populate('author', 'username')
	if (!listing) {
		res.status(404)
			.json({ code: 'NOT_FOUND', message: 'Market listing not found' })
		return
	}

	let newPictureObjectNames: (typeof body)['pictures'] extends object
		? string[] : never

	// validate `pictures`
	if (body.pictures) {
		// To check that all new pictures are used, and all pictures (existing and
		// new) are unique
		const newPicturesUsedVector = new Array(body.newPictures?.length ?? 0).fill(false)
		const existingPicturesUsedVector = new Array(listing.pictures.length).fill(false)

		for (const index of body.pictures) {
			if (index < 0) { // new picture
				const newIndex = -index - 1

				if (newIndex >= body.newPictures.length) {
					res.status(400).json({
						code: 'INVALID_REQUEST',
						message: 'Invalid picture index',
					})
					return
				}

				if (newPicturesUsedVector[newIndex]) {
					res.status(400).json({
						code: 'INVALID_REQUEST',
						message: 'Duplicate picture index',
					})
					return
				}

				newPicturesUsedVector[newIndex] = true

			} else { // existing picture
				if (index >= listing.pictures.length) {
					res.status(400).json({
						code: 'INVALID_REQUEST',
						message: 'Invalid picture index',
					})
					return
				}

				if (existingPicturesUsedVector[index]) {
					res.status(400).json({
						code: 'INVALID_REQUEST',
						message: 'Duplicate picture index',
					})
					return
				}

				existingPicturesUsedVector[index] = true
			}
		}

		if (newPicturesUsedVector.some((used) => !used)) {
			res.status(400).json({
				code: 'INVALID_REQUEST',
				message: 'Not all new pictures are used',
			})
			return
		}

		const newPictures: { data: Buffer, info: formidable.File }[] | undefined =
			body.newPictures
		newPictureObjectNames = newPictures?.map((file) => {
			const extension = mimeTypeToExtension[file.info.mimetype!]
			return `${uuid()}.${extension}`
		}) ?? []

		const results = await Promise.allSettled(
			newPictures?.map(
				({ data, info }, index: number) => {
					const objectName = newPictureObjectNames[index]
					return minioClient.putObject(
						env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS,
						objectName,
						data,
						env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT,
						{
							originalFilename: info.originalFilename,
							mimetype: info.mimetype,
							listingId: listingId.toString(),
						}
					)
				}
			) ?? []
		)

		if (results.some((result) => result.status === 'rejected')) {
			// delete all successfully uploaded pictures in **background**
			results.forEach((result, index) => {
				if (result.status !== 'fulfilled') return

				const objectName = newPictureObjectNames[index]
				minioClient
					.removeObject(
						env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS,
						objectName,
					)
					.catch((err) => {
						console.warn('PATCH /market/listings | (Upload failure cleanup) Error deleting picture:', err)
					})
			})

			res.status(500).json({
				code: 'SERVER_ERROR',
				message: 'Error uploading pictures',
			})
			return
		}

		const picturesToDelete = listing.pictures
			.filter((_, index) => !existingPicturesUsedVector[index])

		await Promise.all(
			picturesToDelete.map((filename) =>
				minioClient
					.removeObject(env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS, filename)
			)
		).catch((err) => {
			console.warn('PATCH /market/listings | Error deleting pictures:', err)
		})

		listing.pictures = body.pictures.map((index: number) => {
			if (index < 0) {
				const newIndex = -index - 1
				return newPictureObjectNames[newIndex]
			} else {
				return listing.pictures[index]
			}
		})
	}
	if (body.title) listing.title = body.title
	if (body.description) listing.description = body.description
	if (body.priceInCents) listing.priceInCents = body.priceInCents
	if (body.countries) listing.countries = body.countries
	listing.editedAt = new Date()

	await listing.save()

	res.status(200).json({
		id: listing.id,
		title: listing.title,
		description: listing.description,
		pictures: listing.pictures.map((picture: string) =>
			`${env.MINIO_PUBLIC_ENDPOINT}/`
			+ `${env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS}/`
			+ `${picture.toString()}`
		),
		author: {
			id: (listing.author as { id: mongoose.Types.ObjectId }).id.toString(),
			username: (listing.author as { username: string }).username,
		},
		priceInCents: listing.priceInCents,
		countries: listing.countries,
		listedAt: listing.listedAt.toISOString(),
		editedAt: listing.editedAt?.toISOString(),
	})
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