import { ChatMessageType, ClientChatMessage } from "@/data/types/chats"
import { str2ab } from "@/utils"
import { SendChatMessagePayload } from "@/data/frontend/queries/sendChatMessage"
import { decryptMessage, encryptMessage } from "."


export async function decryptChatMessages(
	messages: ClientChatMessage[],
	sharedKey: CryptoKey,
): Promise<ClientChatMessage[]> {
	const result = new Array(messages.length).fill(null)

	await Promise.all(
		messages.map(async (message, index) => {
			if (!message.e2e) {
				result[index] = message
				return
			}

			const cipher = str2ab(atob(message.content as string))

			const iv = str2ab(atob(message.e2e.iv))
			const content = await decryptMessage(cipher, new Uint8Array(iv), sharedKey)
			const newMessage: ClientChatMessage = {
				...message,
				content: new TextDecoder().decode(content),
			}
			result[index] = newMessage
		})
	)

	return result
}

export async function encryptChatMessage(
	message: SendChatMessagePayload<string | ArrayBuffer>,
	sharedKey: CryptoKey,
): Promise<SendChatMessagePayload> {
	if (message.type !== ChatMessageType.Text) {
		throw new Error("Only text messages are supported right now")
	}

	const messageBytes: Uint8Array<ArrayBufferLike> =
		typeof message.content === "string"
			? new TextEncoder().encode(message.content)
			: new Uint8Array(message.content)
	const encrypted = await encryptMessage(messageBytes, sharedKey)

	return {
		...message,
		content: encrypted.ciphertext,
		e2e: {
			iv: encrypted.iv.buffer,
		},
	}
}