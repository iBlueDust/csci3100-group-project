const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000/api'

export const api = {
	async fetch(url: string, options?: RequestInit) {
		return await fetch(
			API_ENDPOINT + url,
			{
				...options,
				headers: {
					'Content-Type': 'application/json',
					...options?.headers,
				},
			}
		)
	}
}