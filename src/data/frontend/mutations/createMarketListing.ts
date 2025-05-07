import type { Api } from "@/utils/frontend/api"
import { postMarketListing, PostMarketListingPayload } from "@/data/frontend/fetches/postMarketListing"

export async function createMarketListing(
	api: Api,
	listing: PostMarketListingPayload,
): ReturnType<typeof postMarketListing> {
	return await postMarketListing(api, listing)
}