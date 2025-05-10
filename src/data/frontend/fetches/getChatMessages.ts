import { EncryptedClientChatMessage } from "@/data/types/chats"
import { PaginatedResult, PaginationOptions } from "@/data/types/common"
import { Api } from "@/utils/frontend/api"

export async function getChatMessages(
	api: Api,
	chatId: string,
	options: Partial<PaginationOptions> = {},
): Promise<PaginatedResult<EncryptedClientChatMessage<string>>> {
	const params = new URLSearchParams()
	if (options.skip) params.set('page', options.skip.toString())
	if (options.limit) params.set('limit', options.limit.toString())

	const response = await api.fetch(`/chats/${chatId}/messages?${params}`, {
		headers: { 'Content-Type': 'application/json' },
	})
	if (!response.ok) {
		console.error('Failed to fetch messages')
		throw new Error(`Failed to fetch messages ${response.statusText}`)
	}

	const body = await response.json()
	return body
}