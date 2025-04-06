import type mongoose from 'mongoose'

import MarketListing from '@/data/db/mongo/models/market-listing'

import type { MarketListingSearchResult } from './searchMarketListings'

export const getMarketListingById = async (
	id: mongoose.Types.ObjectId,
): Promise<MarketListingSearchResult | null> => {
	const listing = await MarketListing.findById(id)
		.populate('author', '_id username')
		.select('-__v')
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		.lean() as any | null

	if (!listing) {
		return null
	}

	return makeMarketListingClientFriendly(listing)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeMarketListingClientFriendly = (listing: any) => {
	listing.id = listing._id.toString()
	delete listing._id

	if (typeof listing.author === 'object') {
		listing.author.id = listing.author._id.toString()
		delete listing.author._id
	} else {
		listing.author = { id: listing.author.toString() }
	}

	listing.listedAt = (listing.listedAt as Date).toISOString()
	if (listing.editedAt)
		listing.editedAt = (listing.editedAt as Date).toISOString()

	return listing as MarketListingSearchResult
}