import { MarketListingSearchResult } from "@/data/api/mongo/queries/market"
import { SearchMarketListingsOptions } from "@/data/api/mongo/queries/market/searchMarketListings"
import { PaginatedResult } from "@/types/common"
import type { Api } from "@/hooks/useApi"

export async function getMarketListings(
	api: Api,
	options: SearchMarketListingsOptions = {},
): Promise<PaginatedResult<MarketListingSearchResult>> {
	const params = new URLSearchParams()
	if (options.query) params.append('query', options.query)
	if (options.countries) params.append('countries', options.countries.join(','))
	if (options.categories) {
		params.append('categories', options.categories.join(','))
	}
	if (options.priceMin) params.append('priceMin', options.priceMin.toString())
	if (options.priceMax && Number.isFinite(options.priceMax)) {
		params.append('priceMax', options.priceMax.toString())
	}
	if (options.author) params.append('author', options.author.toString())
	if (options.sort) params.append('sort', options.sort.toString())
	if (options.skip) params.append('skip', options.skip.toString())
	if (options.limit) params.append('limit', options.limit.toString())

	const response = await api.fetch(`/market/listings?${params.toString()}`)
	if (!response.ok) {
		throw new Error(`Failed to fetch market listings ${response.statusText}`)
	}
	const body = await response.json()
	return body as PaginatedResult<MarketListingSearchResult>
}