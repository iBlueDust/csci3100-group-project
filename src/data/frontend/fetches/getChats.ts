import type { EncryptedClientChat } from "@/types/chats"
import type { PaginatedResult } from "@/types/common"
import type { Api } from "@/hooks/useApi"

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