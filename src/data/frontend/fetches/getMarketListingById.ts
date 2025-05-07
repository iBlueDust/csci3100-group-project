import type { MarketListingSearchResult } from "@/data/db/mongo/queries/market"
import type { Api } from "@/utils/frontend/api"

export async function getMarketListingById(
	api: Api,
	id: string
): Promise<MarketListingSearchResult> {
	const response = await api.fetch(`/market/listings/${id}`, {
		headers: { 'Content-Type': 'application/json' },
	})
	if (!response.ok) {
		console.error(`Failed to fetch market listing ${id} ${response.statusText}`)
		throw new Error(`Failed to fetch market listing ${id} ${response.statusText}`)
	}

	const body = await response.json()
	return body
}