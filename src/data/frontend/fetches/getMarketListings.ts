import { MarketListingSearchResult } from "@/data/db/mongo/queries/market"
import { SearchMarketListingsOptions } from "@/data/db/mongo/queries/market/searchMarketListings"
import { PaginatedResult } from "@/data/types/common"
import type { Api } from "@/utils/frontend/api"

export async function getMarketListings(
	api: Api,
	options: SearchMarketListingsOptions = {},
): Promise<PaginatedResult<MarketListingSearchResult>> {
	const params = new URLSearchParams()
	if (options.query) params.append('query', options.query)
	if (options.countries) params.append('countries', options.countries.join(','))
	if (options.priceMin) params.append('priceMin', options.priceMin.toString())
	if (options.priceMax) params.append('priceMax', options.priceMax.toString())
	if (options.skip) params.append('skip', options.skip.toString())
	if (options.limit) params.append('limit', options.limit.toString())

	const response = await api.fetch(`/market/listings?${params.toString()}`)
	if (!response.ok) {
		throw new Error(`Failed to fetch market listings ${response.statusText}`)
	}
	const body = await response.json()
	return body as PaginatedResult<MarketListingSearchResult>
}