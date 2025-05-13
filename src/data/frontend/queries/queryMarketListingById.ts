import { getMarketListingById } from "@/data/frontend/fetches/getMarketListingById"
import { MarketListingSearchResult } from "@/data/api/mongo/queries/market"
import type { Api } from "@/hooks/useApi"

export async function queryMarketListingById(
	api: Api,
	id: string,
): Promise<MarketListingSearchResult> {
	if (!api.user) throw new Error('User or key not found')

	return await getMarketListingById(api, id)
}