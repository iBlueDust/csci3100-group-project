import { ChatMessageType, ClientChat, ClientChatMessage } from "@/data/types/chats"
import { str2ab } from "@/utils"
import { PostChatMessagePayload } from "@/data/frontend/fetches/postChatMessage"
import { decryptMessage, deriveKey, encryptMessage, importKey } from "."


export async function decryptChat(
	chat: ClientChat,
	myUserId: string,
	myPrivateKey: CryptoKey
): Promise<ClientChat & { sharedKey: CryptoKey }> {
	if (chat.lastMessage && !chat.lastMessage.e2e) {
		throw new Error("Chat message is not encrypted")
	}

	const otherParty = chat.participants.find(
		(participant) => participant.id !== myUserId
	)
	if (!otherParty?.publicKey) {
		throw new Error("Could not find other party's public key")
	}

	const theirPublicKey = await importKey(otherParty!.publicKey, 'jwk', [])
	const sharedKey = await deriveKey(theirPublicKey, myPrivateKey)

	return {
		...chat,
		lastMessage: chat.lastMessage
			? await decryptChatMessage(chat.lastMessage, sharedKey)
			: undefined,
		sharedKey,
	}
}

export async function decryptChats(
	chats: ClientChat[],
	myUserId: string,
	myPrivateKey: CryptoKey,
): Promise<(ClientChat & { sharedKey: CryptoKey })[]> {
	const result = new Array(chats.length).fill(null)

	await Promise.all(
		chats.map(async (chat, index) => {
			result[index] = await decryptChat(chat, myUserId, myPrivateKey)
		})
	)

	return result
}

export async function decryptChatMessage(
	message: ClientChatMessage,
	sharedKey: CryptoKey,
): Promise<ClientChatMessage> {
	if (message.type === ChatMessageType.Attachment) {
		throw new Error("Attachment messages are not supported yet")
	}

	if (!message.e2e) {
		return message
	}

	const cipher = str2ab(atob(message.content as string))

	const iv = str2ab(atob(message.e2e.iv))
	const content = await decryptMessage(cipher, new Uint8Array(iv), sharedKey)
	const newMessage: ClientChatMessage = {
		...message,
		content: new TextDecoder().decode(content),
	}
	return newMessage
}

export async function decryptChatMessages(
	messages: ClientChatMessage[],
	sharedKey: CryptoKey,
): Promise<ClientChatMessage[]> {
	const result = new Array(messages.length).fill(null)

	await Promise.all(
		messages.map(async (message, index) => {
			result[index] = await decryptChatMessage(message, sharedKey)
		})
	)

	return result
}

export async function encryptChatMessage(
	message: PostChatMessagePayload<string | ArrayBuffer>,
	sharedKey: CryptoKey,
): Promise<PostChatMessagePayload> {
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