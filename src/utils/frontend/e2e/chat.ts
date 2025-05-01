import {
	ChatMessageType,
	ClientChat,
	ClientChatMessage,
	EncryptedClientChat,
	EncryptedClientChatMessage,
} from "@/data/types/chats"
import {
	EncryptedPostChatMessagePayload,
	PostChatMessagePayload,
} from "@/data/frontend/fetches/postChatMessage"
import { str2ab } from "@/utils"
import { decryptMessage, deriveKey, encryptMessage, importKey } from "."


export async function decryptChat(
	chat: EncryptedClientChat,
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
	chats: EncryptedClientChat[],
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
	message: EncryptedClientChatMessage,
	sharedKey: CryptoKey,
): Promise<ClientChatMessage> {
	if (!message.e2e) {
		throw new Error("No decryption data to decrypt message")
	}

	const iv = new Uint8Array(str2ab(atob(message.e2e.iv)))

	if (message.type === ChatMessageType.Text) {
		const cipher = str2ab(atob(message.content as string))
		const content = await decryptMessage(cipher, iv, sharedKey)
		const newMessage: ClientChatMessage = {
			...message,
			content: new TextDecoder().decode(content),
		}
		return newMessage
	} else {
		let decryptedFilename: string | undefined = undefined
		if (message.contentFilename) {
			const filenameCipher = str2ab(atob(message.contentFilename))
			const filename = await decryptMessage(filenameCipher, iv, sharedKey)
			decryptedFilename = new TextDecoder().decode(filename)
		}

		return {
			...message,
			contentFilename: decryptedFilename,
		}
	}
}

export async function decryptChatMessages(
	messages: EncryptedClientChatMessage[],
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
	message: PostChatMessagePayload,
	sharedKey: CryptoKey,
): Promise<EncryptedPostChatMessagePayload> {
	const contentBytes: Uint8Array<ArrayBufferLike> =
		typeof message.content === "string"
			? new TextEncoder().encode(message.content)
			: new Uint8Array(message.content)
	const encryptedContent = await encryptMessage(contentBytes, sharedKey)
	const iv = encryptedContent.iv

	if (message.type === ChatMessageType.Text) {
		return {
			...message,
			content: encryptedContent.ciphertext,
			e2e: { iv: iv.buffer },
		}
	} else {
		let encryptedFilename: {
			iv: Uint8Array<ArrayBufferLike>
			ciphertext: ArrayBuffer
		} | undefined = undefined

		if (message.contentFilename) {
			const filenameBytes = new TextEncoder().encode(message.contentFilename)
			encryptedFilename = await encryptMessage(filenameBytes, sharedKey, iv)
		}

		return {
			...message,
			content: encryptedContent.ciphertext,
			contentFilename: encryptedFilename?.ciphertext,
			e2e: { iv: iv.buffer },
		}
	}
}