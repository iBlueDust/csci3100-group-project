import { encryptChatMessage } from "@/utils/frontend/e2e/chat"
import { postChatMessage, PostChatMessagePayload } from "@/data/frontend/fetches/postChatMessage"
import type { Api } from "@/utils/frontend/api"

export async function sendChatMessage(
	api: Api,
	chatId: string,
	message: PostChatMessagePayload,
	sharedKey: CryptoKey,
) {
	const encryptedMessage = await encryptChatMessage(message, sharedKey)
	await postChatMessage(api, chatId, encryptedMessage)
}