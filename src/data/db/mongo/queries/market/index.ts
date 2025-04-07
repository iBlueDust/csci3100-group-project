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
	editedAt?: string,
	priceInCents: number,
	countries: string[],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeMarketListingClientFriendly = (listing: any) => {
	listing.id = listing._id
	delete listing._id

	if (typeof listing.author === 'object') {
		listing.author.id = listing.author._id
		delete listing.author._id
	} else {
		listing.author = { id: listing.author }
	}

	listing.listedAt = (listing.listedAt as Date).toISOString()
	if (listing.editedAt)
		listing.editedAt = (listing.editedAt as Date).toISOString()

	return listing as MarketListingSearchResult
}