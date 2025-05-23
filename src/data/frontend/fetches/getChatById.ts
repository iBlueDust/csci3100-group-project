import type { EncryptedClientChat } from "@/types/chats"
import type { Api } from "@/hooks/useApi"

export async function getChatById(
	api: Api,
	id: string
): Promise<EncryptedClientChat> {
	const response = await api.fetch(`/chats/${id}`, {
		headers: { 'Content-Type': 'application/json' },
	})
	if (!response.ok) {
		console.error(`Failed to fetch chat ${id} ${response.statusText}`)
		throw new Error(`Failed to fetch chat ${id} ${response.statusText}`)
	}

	const body = await response.json()
	return body
}