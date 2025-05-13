import { getChatByRecipient } from "@/data/frontend/fetches/getChatByRecipient"
import { Api } from "@/hooks/useApi"
import { decryptChat } from "@/utils/frontend/e2e/chat"
import type { ClientChat } from "@/types/chats"

export async function queryChatByRecipient(
	api: Api,
	recipientId: string,
): Promise<ClientChat & { sharedKey: CryptoKey }> {
	if (!api.user || !api.uek) throw new Error('User or key not found')

	const chats = await getChatByRecipient(api, recipientId)
	const decryptedChat = await decryptChat(
		chats,
		api.user.id,
		api.uek.privateKey,
	)

	return decryptedChat
}