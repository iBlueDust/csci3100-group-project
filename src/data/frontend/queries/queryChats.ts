import { getChats } from "@/data/frontend/fetches/getChats"
import { Api } from "@/utils/frontend/api"
import { decryptChats } from "@/utils/frontend/e2e/chat"
import type { ClientChat } from "@/data/types/chats"
import type { PaginatedResult } from "@/data/types/common"

export async function queryChats(
	api: Api,
): Promise<PaginatedResult<ClientChat & { sharedKey: CryptoKey }>> {
	const chats = await getChats(api)

	if (!api.user || !api.uek) throw new Error('User or key not found')
	const decryptedChats = await decryptChats(
		chats.data,
		api.user!.id,
		api.uek!.privateKey,
	)

	return {
		data: decryptedChats,
		meta: chats.meta,
	}
}