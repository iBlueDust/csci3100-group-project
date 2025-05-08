import type { Api } from "@/utils/frontend/api"

export interface PostMarketListingPayload {
	title: string
	description: string,
	pictures: File[],
	priceInCents: number,
	countries: string[],
}


export type PostMarketListingResponse = { id: string }

export async function postMarketListing(
	api: Api,
	payload: PostMarketListingPayload,
): Promise<PostMarketListingResponse> {
	const formData = new FormData()
	if (payload.title) formData.append('title', payload.title)
	if (payload.description) formData.append('description', payload.description)
	if (payload.pictures) {
		for (const picture of payload.pictures) {
			formData.append('pictures', picture)
		}
	}
	if (payload.priceInCents) {
		formData.append('priceInCents', payload.priceInCents.toString())
	}
	if (payload.countries) {
		formData.append('countries', payload.countries.join(',').toLowerCase())
	}

	const response = await api.fetch('/market/listings', {
		method: 'POST',
		// Do not set content type to multipart/form-data, as it will not work with the fetch API
		// headers: { 'Content-Type': 'multipart/form-data' },
		body: formData,
	})

	if (!response.ok) {
		console.error('Failed to create market listing')
		throw new Error(`Failed to create market listing ${api.user?.username}:${payload} ${response.statusText}`)
	}

	const body = await response.json()

	return body as { id: string }
}