import type { ClientChat } from "@/data/types/chats"
import type { PaginatedResult } from "@/data/types/common"
import type { Api } from "@/utils/frontend/api"

export async function getChats(api: Api): Promise<PaginatedResult<ClientChat>> {
	const response = await api.fetch('/chats')
	if (!response.ok) {
		console.error('Failed to fetch chats')
		throw new Error(`Failed to fetch chats ${response.statusText}`)
	}

	const body = await response.json()
	return body
}