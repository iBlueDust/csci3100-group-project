import { patchMarketListing, PatchMarketListingPayload } from "@/data/frontend/fetches/patchMarketListing"
import type { Api } from "@/hooks/useApi"

export async function updateMarketListing(
	api: Api,
	listingId: string,
	changes: PatchMarketListingPayload,
): ReturnType<typeof patchMarketListing> {
	return await patchMarketListing(api, listingId, changes)
}