import type mongoose from 'mongoose'

import MarketListing from '@/data/db/mongo/models/market-listing'
import {
	type MarketListingSearchResult,
	makeMarketListingClientFriendly,
} from '.'


export const getMarketListingById = async (
	id: mongoose.Types.ObjectId,
): Promise<MarketListingSearchResult | null> => {
	const listing = await MarketListing.findById(id)
		.populate('author', '_id username publicKey')
		.select('-__v')
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		.lean() as any | null

	if (!listing) {
		return null
	}

	return makeMarketListingClientFriendly(listing)
}