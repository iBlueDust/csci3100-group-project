import type { Api } from "@/utils/frontend/api"
import { postChat } from "@/data/frontend/fetches/postChat"

export async function createNewChatByUsername(
	api: Api,
	recipientUsername: string,
): ReturnType<typeof postChat> {
	return await postChat(api, { recipientUsername })
}