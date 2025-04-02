import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'

import mongoose from 'mongoose'
import MarketListing from '@/data/db/mongo/models/market-listing'
import dbConnect from '@/data/db/mongo'
import { Error, PaginatedResult } from '@/data/types/common'
import { MarketListingSearchResult, searchMarketListings } from '@/data/db/mongo/queries/market/searchMarketListings'

type GetData = PaginatedResult<MarketListingSearchResult>

async function GET(
	req: NextApiRequest,
	res: NextApiResponse<GetData | Error>,
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

	res.status(200).json(listings)
}

// async function POST(
// 	req: NextApiRequest,
// 	res: NextApiResponse<GetData | Error>,
// 	auth: AuthData,
// ) {
// 	const { value: recipientId, error } = Joi.string().required().validate(req.query.id)

// 	if (error) {
// 		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
// 		return
// 	}

// 	let recipient: mongoose.Types.ObjectId
// 	try {
// 		recipient = new mongoose.Types.ObjectId(recipientId)
// 	} catch {
// 		return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Invalid recipient ID' })
// 	}

// 	await dbConnect()
// 	const chat = await Chat.create({ participants: [auth.data.userId, recipient] })

// 	res.status(200).json({ id: chat.id })
// }

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<GetData | Error>,
) {
	switch (req.method) {
		case 'GET':
			return await GET(req, res)
		// case 'POST':
		// 	return await protectedRoute(POST, sessionStore)(req, res)

		case 'POST':
			await dbConnect()
			await MarketListing.create({
				title: 'test listing',
				description: 'Consectetur proident officia aliquip nostrud in excepteur exercitation dolor et ad.',
				pictures: [],
				author: new mongoose.Types.ObjectId('67cca80f4c70a82f8e1a36c7'),
				listedAt: new Date(),
				priceInCents: 1000,
				countries: ['us', 'ca'],
			})
			return res.status(200).end()
		default:
			res.status(405).end() // Method Not Allowed
	}
}
