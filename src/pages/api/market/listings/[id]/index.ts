import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import mongoose from 'mongoose'

import dbConnect from '@/data/db/mongo'
import { Error } from '@/data/types/common'
import { getMarketListingById } from '@/data/db/mongo/queries/market/getMarketListingById'

type GetData = { id: string }

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

// async function DELETE(
// 	req: NextApiRequest,
// 	res: NextApiResponse<DeleteData | Error>,
// 	auth: AuthData,
// ) {
// 	const { value: id, error } = Joi.string().required().validate(req.query.id)

// 	if (error) {
// 		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
// 		return
// 	}

// 	let listingId: mongoose.Types.ObjectId
// 	try {
// 		listingId = new mongoose.Types.ObjectId(id)
// 	} catch {
// 		return res
// 			.status(400)
// 			.json({ code: 'INVALID_REQUEST', message: 'Invalid market listing ID' })
// 	}

// 	await dbConnect()

// 	const chat = await MarketListing.findOne({
// 		_id: listingId,
// 		author: auth.data.userId,
// 	})

// 	if (!chat) {
// 		return res
// 			.status(404)
// 			.json({ code: 'NOT_FOUND', message: 'Chat not found' })
// 	}

// 	if (chat.deleteRequesters.length >= chat.participants.length - 1) {
// 		await chat.deleteOne()
// 		console.log(`Deleted chat ${listingId}`)

// 		// In case this chat was deleted by the other party between the time we checked
// 		// and now (race condition), let's clean up all chats that should be deleted
// 		// delete all chats where deleteRequesters.length >= participants.length - 1
// 		const results = await Chat.deleteMany({
// 			$expr: {
// 				$gte: [
// 					{ $size: "$deleteRequesters" },
// 					{ $subtract: [{ $size: "$participants" }, 1] }
// 				]
// 			}
// 		}).catch(() => null)

// 		if (results) {
// 			console.log(`Deleted ${results.deletedCount ?? 0} empty chats`)
// 		} else {
// 			console.error('Failed to delete empty chats')
// 		}

// 		return res.status(200).json({ success: true })
// 	}

// 	chat.deleteRequesters.push(auth.data.userId)
// 	await chat.save()

// 	return res.status(200).json({ success: true })
// }

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<GetData | Error>,
) {
	switch (req.method) {
		case 'GET':
			return await GET(req, res)
		// case 'DELETE':
		// 	return await protectedRoute(DELETE, sessionStore)(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}