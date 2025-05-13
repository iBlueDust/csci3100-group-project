import { postChat } from "@/data/frontend/fetches/postChat"
import type { Api } from "@/hooks/useApi"

export async function createNewChatByUserId(
	api: Api,
	recipientId: string,
): ReturnType<typeof postChat> {
	return await postChat(api, { recipient: recipientId })
}