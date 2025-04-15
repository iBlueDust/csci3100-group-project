import { ClientChatMessage } from "@/data/types/chats"
import { PaginatedResult } from "@/data/types/common"
import { Api } from "@/utils/frontend/api"

export async function getChatMessages(
	api: Api,
	chatId: string,
): Promise<PaginatedResult<ClientChatMessage>> {
	const response = await api.fetch(`/chats/${chatId}/messages`, {
		headers: { 'Content-Type': 'application/json' },
	})
	if (!response.ok) {
		console.error('Failed to fetch messages')
		throw new Error(`Failed to fetch messages ${response.statusText}`)
	}

	const body = await response.json()
	return body
}