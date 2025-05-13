import {
	ChatMessageType,
	ClientChat,
	ClientChatMessage,
	EncryptedClientChat,
	EncryptedClientChatMessage,
} from "@/types/chats"
import {
	EncryptedPostChatMessagePayload,
	PostChatAttachmentMessagePayload,
	PostChatMarketListingMessagePayload,
	PostChatMessagePayload,
	PostChatTextMessagePayload,
} from "@/data/frontend/fetches/postChatMessage"
import { ab2base64, str2ab } from "@/utils/frontend"
import { decryptMessage, deriveKey, encryptMessage, importKey } from "."


export interface EncodedChatContent {
	type: 'text' | 'market-listing'
	nonce: string
	data: string
}

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
	message: EncryptedClientChatMessage<string>,
	sharedKey: CryptoKey,
): Promise<ClientChatMessage> {
	if (!message.e2e) {
		throw new Error("No decryption data to decrypt message")
	}

	const iv = new Uint8Array(str2ab(atob(message.e2e.iv)))

	if (message.type === ChatMessageType.Text) {
		const cipher = str2ab(atob(message.content as string))
		const decryptedCipher = await decryptMessage(cipher, iv, sharedKey)
		const contentStr = new TextDecoder().decode(decryptedCipher)

		let content: EncodedChatContent
		try {
			content = JSON.parse(contentStr)
		} catch {
			return {
				...message,
				type: ChatMessageType.Text,
				content: contentStr,
			}
		}

		const decoded = {
			...message,
			content: content.data,
		} as ClientChatMessage
		if (content.type === 'market-listing') {
			decoded.type = ChatMessageType.MarketListing
		}
		return decoded

	} else {
		let decryptedFilename: string | undefined = undefined
		if (message.contentFilename) {
			const filenameCipher = str2ab(atob(message.contentFilename))
			const filename = await decryptMessage(filenameCipher, iv, sharedKey)
			decryptedFilename = new TextDecoder().decode(filename)
		}

		return {
			...message,
			content: message.content,
			contentFilename: decryptedFilename,
		}
	}
}

export async function decryptChatMessages(
	messages: EncryptedClientChatMessage<string>[],
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
	if (message.type === ChatMessageType.Text) {
		return await encryptTextMessage(message, sharedKey)
	} else if (message.type === ChatMessageType.MarketListing) {
		return await encryptMarketListingMessage(message, sharedKey)
	} else {
		return await encryptAttachmentMessage(message, sharedKey)
	}
}

async function encryptTextMessage(
	message: PostChatTextMessagePayload,
	sharedKey: CryptoKey,
): Promise<EncryptedPostChatMessagePayload> {
	const content = JSON.stringify({
		type: 'text',
		nonce: generateNonce(),
		data: message.content,
	} as EncodedChatContent)
	const encryptedContent = await encryptChatContent(content, sharedKey)

	return {
		...message,
		type: ChatMessageType.Text,
		content: encryptedContent.ciphertext,
		e2e: { iv: encryptedContent.iv.buffer },
	}
}

async function encryptMarketListingMessage(
	message: PostChatMarketListingMessagePayload,
	sharedKey: CryptoKey,
): Promise<EncryptedPostChatMessagePayload> {
	const content = JSON.stringify({
		type: 'market-listing',
		nonce: generateNonce(),
		data: message.content,
	} as EncodedChatContent)
	const encryptedContent = await encryptChatContent(content, sharedKey)

	return {
		...message,
		type: ChatMessageType.Text, // force to text type for now
		content: encryptedContent.ciphertext,
		e2e: { iv: encryptedContent.iv.buffer },
	}
}

async function encryptAttachmentMessage(
	message: PostChatAttachmentMessagePayload,
	sharedKey: CryptoKey,
): Promise<EncryptedPostChatMessagePayload> {
	const { ciphertext, iv } = await encryptChatContent(message.content, sharedKey)

	const encryptedFilename = message.contentFilename
		? (
			await encryptMessage(
				new TextEncoder().encode(message.contentFilename),
				sharedKey,
				iv
			)
		)
		: null

	return {
		...message,
		content: ciphertext,
		contentFilename: encryptedFilename?.ciphertext,
		e2e: { iv: iv.buffer },
	}
}

async function encryptChatContent(content: string | ArrayBuffer, sharedKey: CryptoKey) {
	const contentBytes: Uint8Array<ArrayBufferLike> =
		typeof content === "string"
			? new TextEncoder().encode(content)
			: new Uint8Array(content)
	const encryptedContent = await encryptMessage(contentBytes, sharedKey)
	return encryptedContent
}

function generateNonce(): string {
	const { buffer } = window.crypto.getRandomValues(new Uint8Array(12))
	return ab2base64(buffer)
}