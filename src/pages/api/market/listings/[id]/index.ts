import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import mongoose from 'mongoose'

import dbConnect from '@/data/db/mongo'
import MarketListing from '@/data/db/mongo/models/market-listing'
import { Error } from '@/data/types/common'
import { sessionStore } from '@/data/session'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import { getMarketListingById } from '@/data/db/mongo/queries/market/getMarketListingById'

type GetData = { id: string }
type DeleteData = { success: boolean }

async function GET(
	req: NextApiRequest,
	res: NextApiResponse<GetData | Error>,
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

async function DELETE(
	req: NextApiRequest,
	res: NextApiResponse<DeleteData | Error>,
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
	res: NextApiResponse<GetData | Error>,
) {
	switch (req.method) {
		case 'GET':
			return await GET(req, res)
		case 'DELETE':
			return await protectedRoute(DELETE, sessionStore)(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}