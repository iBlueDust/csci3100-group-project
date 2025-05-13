import type { ClientChat } from "@/types/chats"
import { getChatById } from "@/data/frontend/fetches/getChatById"
import type { Api } from "@/hooks/useApi"
import { decryptChat } from "@/utils/frontend/e2e/chat"

export async function queryChatById(
	api: Api,
	id: string,
): Promise<ClientChat & { sharedKey: CryptoKey }> {
	const chats = await getChatById(api, id)

	if (!api.user || !api.uek) throw new Error('User or key not found')
	const decryptedChat = await decryptChat(
		chats,
		api.user!.id,
		api.uek!.privateKey,
	)

	return decryptedChat
}