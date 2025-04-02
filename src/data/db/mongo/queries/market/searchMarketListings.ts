import MarketListing from '@/data/db/mongo/models/market-listing'
import User from '@/data/db/mongo/models/user'
import type { PaginatedResult } from '@/data/types/common'
import type { PipelineStage } from 'mongoose'


export interface SearchMarketListingsOptions {
	query?: string
	countries?: string[]
	priceMin?: number
	priceMax?: number
	skip?: number
	limit?: number
}

export interface MarketListingSearchResult {
	id: string,
	title: string,
	description: string,
	pictures: string[],
	author: {
		id: string,
		username?: string,
	},
	listedAt: string,
	priceInCents: number,
	countries: string[],
}

export const searchMarketListings = async (
	options: SearchMarketListingsOptions,
): Promise<PaginatedResult<MarketListingSearchResult>> => {
	const { query, countries, priceMin, priceMax, skip = 0, limit = 10 } = options

	const pipeline: PipelineStage[] = []


	if (countries || priceMin || priceMax) {
		const filter: Record<string, object> = {}
		if (priceMin) {
			filter.priceInCents = { $gte: priceMin * 100 }
		}
		if (priceMax) {
			filter.priceInCents = { ...filter.priceInCents, $lte: priceMax * 100 }
		}
		if (countries && countries.length > 0) {
			filter.countries = { $in: countries }
		}
		pipeline.push({ $match: filter })
	}

	if (query) {
		pipeline.push({
			$match: {
				$text: { $search: query }
			}
		})
		pipeline.push({
			$addFields: {
				queryScore: { $meta: 'textScore' }
			}
		})
	}

	pipeline.push({
		$facet: {
			data: [
				{ $sort: { queryScore: -1, listedAt: -1 } },
				{ $skip: skip },
				{ $limit: limit },
				{
					$lookup: {
						from: User.collection.name,
						localField: 'author',
						foreignField: '_id',
						as: 'authorLookup',
						pipeline: [
							{ $project: { username: 1, _id: 1 } }
						]
					}
				},
				{
					$addFields: {
						author: {
							$cond: {
								if: { $gt: [{ $size: "$authorLookup" }, 0] },
								then: { $arrayElemAt: ['$authorLookup', 0] },
								else: "$author"
							}
						}
					}
				},
				{ $project: { authorLookup: 0, __v: 0 } },
			],
			total: [
				{ $count: 'total' }
			],
		}
	})

	const [results] = await MarketListing.aggregate(pipeline)
	const total = results.meta?.[0]?.total || 0
	if (!results || !results.data) {
		return {
			data: [],
			meta: { total, skip, limit },
		}
	}

	const listings: MarketListingSearchResult[] = results.data?.map(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(listing: any) => {
			listing.id = listing._id.toString()
			delete listing._id

			if (typeof listing.author === 'object') {
				listing.author.id = listing.author._id.toString()
				delete listing.author._id
			} else {
				listing.author = { id: listing.author.toString() }
			}

			listing.pictures = listing.pictures.map(
				(picture: string) =>
					`${process.env.MINIO_PUBLIC_ENDPOINT || 'localhost:9000'}/`
					+ `${process.env.MINIO_BUCKET_CHAT_ATTACHMENTS || 'chat-attachments'}/`
					+ `${picture.toString()}`
			)

			listing.listedAt = (listing.listedAt as Date).toISOString()
			return listing
		}
	) || []

	return {
		data: listings,
		meta: { total, skip, limit }
	}
}