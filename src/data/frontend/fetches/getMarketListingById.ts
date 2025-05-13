import type { MarketListingSearchResult } from "@/data/api/mongo/queries/market"
import type { Api } from "@/hooks/useApi"

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