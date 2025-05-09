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
	sort?: string
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
		sort = 'listedAt-desc',
		skip = 0,
		limit = 10,
	} = options

	const pipeline: PipelineStage[] = []


<<<<<<< HEAD
	if (priceMin || priceMax || countries || categories || author) {
		const filter: {
			priceInCents?: { $gte?: number; $lte?: number }
			countries?: { $in: string[] }
			categories?: { $in: string[] }
			author?: string
		} = {}

=======
<<<<<<< HEAD
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
=======
	if (countries || priceMin || priceMax) {
		const filter: Record<string, object> = {}
>>>>>>> delete-listing-integration
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
				$in: categories.map((c: string) => c.trim())
			}
		}
		if (author) {
			filter.author = author
		}
>>>>>>> parent of 356dc51 (implement delete functionality for market listings and chats)
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

	const sortBy: Record<string, -1 | 1> = { queryScore: -1 }
	if (sort === 'listedAt-desc') {
		sortBy.listedAt = -1
	} else if (sort === 'price-asc') {
		sortBy.priceInCents = 1
	} else if (sort === 'price-desc') {
		sortBy.priceInCents = -1
	}

	pipeline.push({
		$facet: {
			data: [
				{ $sort: sortBy },
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