import { ChatMessageType } from "@/data/types/chats"
import type { Api } from "@/utils/frontend/api"

export interface SendChatMessagePayload {
	type: ChatMessageType
	content: string | Buffer
	contentFilename?: string
	e2e?: object
}

export async function sendChatMessage(
	api: Api,
	chatId: string,
	message: SendChatMessagePayload,
): Promise<{ id: string }> {
	const formData = new FormData()
	formData.set('type', 'text')
	formData.set('content', message.content as string)

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