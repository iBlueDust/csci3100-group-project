import type { Api } from "@/utils/frontend/api"
import { postChat } from "@/data/frontend/fetches/postChat"

export async function createNewChatByUserId(
	api: Api,
	recipientId: string,
): ReturnType<typeof postChat> {
	return await postChat(api, { recipient: recipientId })
}