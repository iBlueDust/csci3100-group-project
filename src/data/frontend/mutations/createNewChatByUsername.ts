import { postChat } from "@/data/frontend/fetches/postChat"
import type { Api } from "@/hooks/useApi"

export async function createNewChatByUsername(
	api: Api,
	recipientUsername: string,
): ReturnType<typeof postChat> {
	return await postChat(api, { recipientUsername })
}