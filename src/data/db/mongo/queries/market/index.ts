import type mongoose from 'mongoose'

export interface MarketListingSearchResult {
	id: mongoose.Types.ObjectId,
	title: string,
	description: string,
	pictures: string[],
	author: {
		id: mongoose.Types.ObjectId,
		username?: string,
	},
	listedAt: string,
	editedAt?: string,
	priceInCents: number,
	countries: string[],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeMarketListingClientFriendly = (listing: any) => {
	return {
		id: listing.id || listing._id,
		title: listing.title,
		description: listing.description,
		pictures: listing.pictures,
		author: typeof listing.author === 'object' && listing.author !== null
			? {
				id: listing.author.id || listing.author._id,
				username: listing.author.username,
			}
			: { id: listing.author },
		priceInCents: listing.priceInCents,
		countries: listing.countries,
		listedAt: listing.listedAt.toISOString(),
		editedAt: listing.editedAt?.toISOString(),
	} as MarketListingSearchResult
}