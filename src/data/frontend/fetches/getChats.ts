import type { EncryptedClientChat } from "@/data/types/chats"
import type { PaginatedResult } from "@/data/types/common"
import type { Api } from "@/utils/frontend/api"

export async function getChats(
	api: Api,
): Promise<PaginatedResult<EncryptedClientChat>> {
	const response = await api.fetch('/chats', {
		headers: { 'Content-Type': 'application/json' },
	})
	if (!response.ok) {
		console.error('Failed to fetch chats')
		throw new Error(`Failed to fetch chats ${response.statusText}`)
	}

	const body = await response.json()
	return body
}