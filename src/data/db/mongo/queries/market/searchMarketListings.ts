import type { PipelineStage } from 'mongoose'
import mongoose from 'mongoose'

import MarketListing from '@/data/db/mongo/models/market-listing'
import User from '@/data/db/mongo/models/user'
import type { PaginatedResult } from '@/data/types/common'
import {
	type MarketListingSearchResult,
	makeMarketListingClientFriendly,
} from '.'



export interface SearchMarketListingsOptions {
	query?: string
	countries?: string[]
	priceMin?: number
	priceMax?: number
	authorId?: string | mongoose.Types.ObjectId // Add author ID option
	skip?: number
	limit?: number
}

export const searchMarketListings = async (
	options: SearchMarketListingsOptions,
): Promise<PaginatedResult<MarketListingSearchResult>> => {
	const { query, countries, priceMin, priceMax, authorId, skip = 0, limit = 10 } = options

	const pipeline: PipelineStage[] = []


	const filter: Record<string, object | string> = {}
	
	if (typeof priceMin === 'number' && !isNaN(priceMin)) {
		filter.priceInCents = { $gte: priceMin };
	}
	if (typeof priceMax === 'number' && isFinite(priceMax)) {
		if (filter.priceInCents && typeof filter.priceInCents === 'object') {
			filter.priceInCents = { ...filter.priceInCents, $lte: priceMax };
		} else {
			filter.priceInCents = { $lte: priceMax };
		}
	}
	if (countries && countries.length > 0) {
		filter.countries = { $in: countries }
	}
	

	if (authorId) {
		filter.author = authorId
	}
	

	if (Object.keys(filter).length > 0) {
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