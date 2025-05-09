import { ChatMessageType } from "@/data/types/chats"
import { ab2base64, toBinaryBlob } from "@/utils"
import type { Api } from "@/utils/frontend/api"


interface BasePostChatMessagePayload {
	e2e?: { iv: ArrayBuffer }
}

export interface PostChatTextMessagePayload extends BasePostChatMessagePayload {
	type: ChatMessageType.Text
	content: string
}

export interface PostChatAttachmentMessagePayload extends BasePostChatMessagePayload {
	type: ChatMessageType.Attachment
	content: ArrayBuffer
	contentFilename?: string
}

export interface PostChatMarketListingMessagePayload extends BasePostChatMessagePayload {
	type: ChatMessageType.MarketListing
	content: string
}

export type PostChatMessagePayload = PostChatTextMessagePayload | PostChatAttachmentMessagePayload | PostChatMarketListingMessagePayload


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

	if ([ChatMessageType.Text, ChatMessageType.MarketListing].includes(message.type)) {
		if (typeof message.content === 'string') {
			formData.set('content', message.content)
		} else {
			formData.set('content', toBinaryBlob(message.content))
		}

	} else if (message.type === ChatMessageType.Attachment) {
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

		throw new Error(`Failed to send message ${response.statusText}`)
	}

	const body = await response.json()
	return body as { id: string }
}