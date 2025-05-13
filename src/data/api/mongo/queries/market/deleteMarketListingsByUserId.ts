import type mongoose from 'mongoose'

import env from '@/utils/api/env'
import MarketListing from '@/data/api/mongo/models/market-listing'
import minioClient from '@/data/api/minio'

/**
 * Deletes all market listings by authored by a given user
 * @param userId - The ID of the user whose listings to delete
 * @returns The number of listings deleted in total
 */
export const deleteAllMarketListingsByUserId = async (
	userId: mongoose.Types.ObjectId,
): Promise<number> => {

	const listingPictures = await MarketListing
		.find({ author: userId })
		.select('pictures')
	const allPictures = listingPictures.flatMap((listing) => listing.pictures)

	const result = await MarketListing.deleteMany({
		author: userId,
	})

	await minioClient.removeObjects(
		env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS,
		allPictures,
	)

	return result.deletedCount ?? 0
}