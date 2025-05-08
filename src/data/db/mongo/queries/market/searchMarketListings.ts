import type { PipelineStage } from 'mongoose'

import MarketListing from '@/data/db/mongo/models/market-listing'
import User from '@/data/db/mongo/models/user'
import type { PaginatedResult } from '@/data/types/common'
import {
	type MarketListingSearchResult,
	makeMarketListingClientFriendly,
} from '.'



export interface SearchMarketListingsOptions {
	query?: string
	categories?: string[]
	countries?: string[]
	priceMin?: number
	priceMax?: number
	author?: string
	skip?: number
	limit?: number
}

export const searchMarketListings = async (
	options: SearchMarketListingsOptions,
): Promise<PaginatedResult<MarketListingSearchResult>> => {
	const {
		query,
		countries,
		categories,
		priceMin,
		priceMax,
		author,
		skip = 0,
		limit = 10,
	} = options

	const pipeline: PipelineStage[] = []


	if (countries || priceMin || priceMax || author) {
		const filter: {
			priceInCents?: { $gte?: number; $lte?: number }
			countries?: { $in: string[] }
			categories?: { $in: string[] }
			author?: string
		} = {}

		if (priceMin) {
			filter.priceInCents = { $gte: priceMin * 100 }
		}
		if (priceMax) {
			filter.priceInCents = { ...filter.priceInCents, $lte: priceMax * 100 }
		}
		if (countries && countries.length > 0) {
			filter.countries = {
				$in: countries.map((country: string) => country.toLowerCase())
			}
		}
		if (categories && categories.length > 0) {
			filter.categories = {
				$in: categories.map((country: string) => country.toLowerCase())
			}
		}
		if (author) {
			filter.author = author
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
							{ $project: { username: 1, publicKey: 1, _id: 1 } }
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
			meta: [
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

	const listings: MarketListingSearchResult[] =
		results.data?.map(makeMarketListingClientFriendly) || []

	return {
		data: listings,
		meta: { total, skip, limit }
	}
}