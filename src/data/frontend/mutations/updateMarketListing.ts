import type { Api } from "@/utils/frontend/api"
import { patchMarketListing, PatchMarketListingPayload } from "@/data/frontend/fetches/patchMarketListing"

export async function updateMarketListing(
	api: Api,
	listingId: string,
	changes: PatchMarketListingPayload,
): ReturnType<typeof patchMarketListing> {
	return await patchMarketListing(api, listingId, changes)
}