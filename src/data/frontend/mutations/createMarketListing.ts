import { postMarketListing, PostMarketListingPayload } from "@/data/frontend/fetches/postMarketListing"
import type { Api } from "@/hooks/useApi"

export async function createMarketListing(
	api: Api,
	listing: PostMarketListingPayload,
): ReturnType<typeof postMarketListing> {
	return await postMarketListing(api, listing)
}