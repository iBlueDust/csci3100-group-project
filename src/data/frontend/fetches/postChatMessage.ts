import { ChatMessageType } from "@/data/types/chats"
import { ab2base64 } from "@/utils"
import type { Api } from "@/utils/frontend/api"

export interface PostChatMessagePayload<
	TContent extends string | ArrayBufferLike = ArrayBuffer,
> {
	type: ChatMessageType
	content: TContent
	contentFilename?: string
	e2e?: {
		iv: ArrayBuffer
	}
}

export async function postChatMessage(
	api: Api,
	chatId: string,
	message: PostChatMessagePayload<ArrayBuffer>,
): Promise<{ id: string }> {
	const formData = new FormData()
	formData.set('type', 'text')
	formData.set('content', ab2base64(message.content))
	if (message.e2e) {
		formData.set('e2e', JSON.stringify({
			...message.e2e,
			iv: ab2base64(message.e2e.iv),
		}))
	}

	const response = await api.fetch(`/chats/${chatId}/messages`, {
		method: 'POST',
		// DO NOT SET HEADERS TO MULTIPART FORM DATA
		// headers: { 'Content-Type': 'multipart/form-data' },
		body: formData,
	})
	if (!response.ok) {
		console.error('Failed to send message')
		throw new Error(`Failed to send message ${response.statusText}`)
	}

	const body = await response.json()
	return body as { id: string }
}