import type mongoose from 'mongoose'

import MarketListing from '@/data/db/mongo/models/market-listing'

/**
 * Deletes all market listings by authored by a given user
 * @param userId - The ID of the user whose listings to delete
 * @returns The number of listings deleted in total
 */
export const deleteAllMarketListingsByUserId = async (
	userId: mongoose.Types.ObjectId,
): Promise<number> => {
	const result = await MarketListing.deleteMany({
		author: userId,
	})

	return result.deletedCount ?? 0
}