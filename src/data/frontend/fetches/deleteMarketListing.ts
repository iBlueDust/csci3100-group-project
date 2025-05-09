import type { Api } from "@/utils/frontend/api"

export async function deleteMarketListing(
	api: Api,
	listingId: string,
): Promise<boolean> {
	try {
		const response = await api.fetch(`/market/listings/${listingId}`, { method: 'DELETE' })
		
		if (response.status === 403) {
			throw new Error(`You do not have permission to delete this listing`)
		}
		
		if (response.status === 404) {
			throw new Error(`Market listing not found`)
		}
		
		if (!response.ok) {

			throw new Error(`Failed to delete market listing: ${response.statusText}`)
		}

		const body = await response.json()
		return body.success
	} catch (error) {

		throw error
	}
}
