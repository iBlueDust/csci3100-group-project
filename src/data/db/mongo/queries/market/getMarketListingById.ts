import type mongoose from 'mongoose'

import MarketListing from '@/data/db/mongo/models/market-listing'

import type { MarketListingSearchResult } from './searchMarketListings'

export const getMarketListingById = async (
	id: mongoose.Types.ObjectId,
): Promise<MarketListingSearchResult | null> => {
	const listing = await MarketListing.findById(id)
		.populate('author', '_id username')
		.select('-__v -_id')
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		.lean() as any | null

	if (!listing) {
		return null
	}

	listing.id = id.toString()

	listing.author.id = listing.author._id.toString()
	delete listing.author._id

	listing.listedAt = (listing.listedAt as Date).toISOString()
	if (listing.editedAt)
		listing.editedAt = (listing.editedAt as Date).toISOString()

	return listing as MarketListingSearchResult
}