import { ChatMessageType } from "@/data/types/chats"
import { ab2base64, toBinaryBlob } from "@/utils"
import type { Api } from "@/utils/frontend/api"

export type PostChatMessagePayload = {
	e2e?: { iv: ArrayBuffer }
} & (
		{ type: ChatMessageType.Text, content: string }
		| {
			type: ChatMessageType.Attachment
			content: ArrayBuffer
			contentFilename?: string
		}
	)

export type EncryptedPostChatMessagePayload = {
	e2e?: { iv: ArrayBuffer }
	content: ArrayBuffer
} & (
		{ type: ChatMessageType.Text }
		| {
			type: ChatMessageType.Attachment
			contentFilename?: ArrayBuffer
		}
	)

export async function postChatMessage(
	api: Api,
	chatId: string,
	message: PostChatMessagePayload | EncryptedPostChatMessagePayload,
): Promise<{ id: string }> {
	const formData = new FormData()

	formData.set('type', message.type)

	if (message.type === ChatMessageType.Text) {
		if (typeof message.content === 'string') {
			formData.set('content', message.content)
		} else {
			formData.set('content', toBinaryBlob(message.content))
		}
	} else {
		formData.set('content', toBinaryBlob(message.content))

		if (message.contentFilename) {
			formData.set('contentFilename', toBinaryBlob(message.contentFilename))
		}
	}

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