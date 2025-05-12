import type { Api } from "@/utils/frontend/api"

export async function deleteMarketListing(
	api: Api,
	id: string,
): Promise<boolean> {
	const response = await api.fetch(`/market/listings/${id}`, {
		method: 'DELETE',
	})
	if (!response.ok) {
		throw new Error(`Failed to delete market listing: ${response.statusText}`)
	}
	const body = await response.json()
	return body.success
}