import { getMarketListingById } from "@/data/frontend/fetches/getMarketListingById"
import type { Api } from "@/utils/frontend/api"
import { MarketListingSearchResult } from "@/data/db/mongo/queries/market"

export async function queryMarketListingById(
	api: Api,
	id: string,
): Promise<MarketListingSearchResult> {
	if (!api.user) throw new Error('User or key not found')

	return await getMarketListingById(api, id)
}