import type { Api } from "@/utils/frontend/api"

export interface PostMarketListingPayload {
	title: string
	description: string,
	pictures: File[],
	priceInCents: number,
	countries: string[],
	categories?: string[],
}


export type PostMarketListingResponse = { id: string }

export async function postMarketListing(
	api: Api,
	payload: PostMarketListingPayload,
): Promise<PostMarketListingResponse> {
	const formData = new FormData()
	formData.append('title', payload.title)
	formData.append('description', payload.description)
	for (const picture of payload.pictures) {
		formData.append('pictures', picture)
	}
	formData.append('priceInCents', payload.priceInCents.toString())
	payload.countries.forEach(country => {
		formData.append('countries', country.toLowerCase())
	})
	payload.categories?.forEach(category => {
		formData.append('categories', category.toLowerCase())
	})

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