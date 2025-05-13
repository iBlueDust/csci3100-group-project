import { decryptChatMessages } from "@/utils/frontend/e2e/chat"
import { getChatMessages } from "@/data/frontend/fetches/getChatMessages"
import type { ClientChatMessage } from "@/types/chats"
import type { PaginatedResult, PaginationOptions } from "@/types/common"
import type { Api } from "@/hooks/useApi"

export async function queryChatMessages(
	api: Api,
	chatId: string,
	sharedKey: CryptoKey,
	options?: Partial<PaginationOptions>,
): Promise<PaginatedResult<ClientChatMessage>> {
	const payload = await getChatMessages(api, chatId, options)
	payload.data.reverse()

	const decryptedMessages = await decryptChatMessages(
		payload.data,
		sharedKey,
	)

	return {
		data: decryptedMessages,
		meta: payload.meta,
	}
}