import type { Api } from "@/hooks/useApi"

export interface PatchMarketListingPayload {
	title?: string
	description?: string,
	pictures?: (File | number)[],
	priceInCents?: number,
	countries?: string[],
	categories?: string[],
}


export type PatchMarketListingResponse = { id: string }

export async function patchMarketListing(
	api: Api,
	listingId: string,
	payload: PatchMarketListingPayload,
): Promise<PatchMarketListingResponse> {
	const formData = new FormData()
	if (payload.title) {
		formData.append('title', payload.title)
	}
	if (payload.description) {
		formData.append('description', payload.description)
	}
	payload.pictures?.forEach(picture => {
		formData.append(
			'pictures',
			typeof picture === 'number' ? picture.toString() : picture,
		)
	})
	if (payload.priceInCents != null) {
		formData.append('priceInCents', payload.priceInCents.toString())
	}
	payload.countries?.forEach(country => {
		formData.append('countries', country.toLowerCase())
	})
	payload.categories?.forEach(category => {
		formData.append('categories', category.toLowerCase())
	})

	const response = await api.fetch(`/market/listings/${listingId}`, {
		method: 'PATCH',
		// Do not set content type to multipart/form-data, as it will not work with the fetch API
		// headers: { 'Content-Type': 'multipart/form-data' },
		body: formData,
	})

	if (!response.ok) {
		console.error('Failed to update market listing')
		throw new Error(`Failed to update market listing ${api.user?.username}:${payload} ${response.statusText}`)
	}

	const body = await response.json()

	return body as { id: string }
}