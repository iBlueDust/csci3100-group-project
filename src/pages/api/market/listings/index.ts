import type { NextApiRequest, NextApiResponse } from 'next'

import { Error as ApiError } from '@/data/types/common'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import { sessionStore } from '@/data/session'
import { parseFormDataBody } from '@/utils/api'
import { isSupportedMimeType } from '@/utils/api/market'
import { getListings, createListing } from '@/services/market/listings/service'
import type { SearchListingsResult } from '@/services/market/listings/types'
import env from '@/env'

type GetData = SearchListingsResult
type PostData = { id: string }

async function GET(
	req: NextApiRequest,
	res: NextApiResponse<GetData | ApiError>,
) {
	try {
		const options = {
			...req.query,
			countries: req.query.countries ?
				(req.query.countries as string).toLowerCase()
					.split(',')
					.map(country => country.trim()) :
				undefined
		}

		const listings = await getListings(options)
		res.status(200).json(listings)
	} catch (error) {
		console.error('GET /market/listings | Error:', error)
		res.status(400).json({
			code: 'INVALID_REQUEST',
			message: error instanceof Error ? error.message : 'Invalid request'
		})
	}
}

async function POST(
	req: NextApiRequest,
	res: NextApiResponse<PostData | ApiError>,
	auth: AuthData,
) {
	try {
		// Parse form data
		const { fields, files, error } = await parseFormDataBody(
			req,
			{
				maxFileSize: env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT,
				filter: part => !!part.mimetype && isSupportedMimeType(part.mimetype),
			},
		)

		if (error) {
			console.warn('POST /market/listings | Error parsing form data:', error)
			return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Invalid form data' })
		}

		// Prepare data for service
		const tryParseInt = (value: unknown) =>
			['string', 'number'].includes(typeof value) ? parseInt(value as string) : null

		const listingData = {
			title: fields?.title?.[0] || "",
			description: fields?.description?.[0] || "",
			pictures: files?.pictures || [],
			priceInCents: tryParseInt(fields?.priceInCents?.[0]) || 0,
			countries: fields?.countries || [],
			userId: auth.data.userId.toString(),
		}

		// Create listing using service
		const result = await createListing(listingData)
		res.status(201).json({ id: result.id })
	} catch (error) {
		console.error('POST /market/listings | Error:', error)

		// Handle different types of errors
		if (error instanceof Error && error.message.includes('Invalid listing data')) {
			return res.status(400).json({
				code: 'INVALID_REQUEST',
				message: error.message
			})
		}

		if (error instanceof Error && error.message.includes('Error uploading pictures')) {
			return res.status(500).json({
				code: 'SERVER_ERROR',
				message: 'Error uploading pictures'
			})
		}

		res.status(500).json({
			code: 'SERVER_ERROR',
			message: 'An unexpected error occurred'
		})
	}
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