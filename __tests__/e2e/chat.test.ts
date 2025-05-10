import { PostChatAttachmentMessagePayload, PostChatMarketListingMessagePayload, PostChatTextMessagePayload } from "@/data/frontend/fetches/postChatMessage"
import { ChatMessageType, EncryptedClientAttachmentChatMessage, EncryptedClientChat, EncryptedClientTextChatMessage } from "@/data/types/chats"
import { decryptMessage, deriveKey } from "@/utils/frontend/e2e"
import { decryptChat, decryptChats, encryptChatMessage } from "@/utils/frontend/e2e/chat"

describe('chat e2e utils', () => {
	let aliceKeyPair: CryptoKeyPair
	let bobKeyPair: CryptoKeyPair
	beforeAll(async () => {
		aliceKeyPair = await crypto.subtle.generateKey(
			{ name: 'ECDH', namedCurve: 'P-521' },
			true,
			['deriveKey']
		)
		bobKeyPair = await crypto.subtle.generateKey(
			{ name: 'ECDH', namedCurve: 'P-521' },
			true,
			['deriveKey']
		)
	})

	it('encrypt and decrypt text message', async () => {
		const sharedKey = await deriveKey(aliceKeyPair.publicKey, aliceKeyPair.privateKey)
		const original = 'hello world'
		const message: PostChatTextMessagePayload = {
			type: ChatMessageType.Text,
			content: original,
		}
		const encrypted = await encryptChatMessage(message, sharedKey)
		const iv = new Uint8Array(encrypted.e2e!.iv)
		const decryptedBytes = await decryptMessage(encrypted.content, iv, sharedKey)
		const parsed = JSON.parse(new TextDecoder().decode(decryptedBytes))
		expect(parsed.data).toBe(original)
		expect(parsed.type).toBe(ChatMessageType.Text)
		expect(parsed.nonce).toBeDefined()
	})

	it('encrypt and decrypt market listing message', async () => {
		const sharedKey = await deriveKey(aliceKeyPair.publicKey, aliceKeyPair.privateKey)
		const original = 'listing_id'
		const message: PostChatMarketListingMessagePayload = {
			type: ChatMessageType.MarketListing,
			content: original,
		}
		const encrypted = await encryptChatMessage(message, sharedKey)
		const iv = new Uint8Array(encrypted.e2e!.iv)
		const decryptedBytes = await decryptMessage(encrypted.content, iv, sharedKey)
		const parsed = JSON.parse(new TextDecoder().decode(decryptedBytes))
		expect(parsed.data).toBe(original)
		expect(parsed.type).toBe(ChatMessageType.MarketListing)
		expect(parsed.nonce).toBeDefined()
	})

	it('encrypt and decrypt attachment message', async () => {
		const sharedKey = await deriveKey(aliceKeyPair.publicKey, aliceKeyPair.privateKey)
		const fileContent = new TextEncoder().encode('file-bytes')
		const fileName = 'it.txt'
		const message: PostChatAttachmentMessagePayload = {
			type: ChatMessageType.Attachment,
			content: Buffer.from(fileContent).buffer,
			contentFilename: fileName,
		}
		const encrypted = await encryptChatMessage(message, sharedKey) as EncryptedClientAttachmentChatMessage
		const iv = new Uint8Array(encrypted.e2e!.iv)

		// decrypt filename
		expect(encrypted.contentFilename).toBeDefined()
		const nameBytes = await decryptMessage(encrypted.contentFilename!, iv, sharedKey)
		expect(new TextDecoder().decode(nameBytes)).toBe(fileName)
	})


	// FIXME: this test fails because there are two ArrayBuffers involved in Node
	// and the browser
	it.skip('decryptChat and decryptChats with a text message', async () => {
		// prepare keys and shared secret
		const aliceJwk = await crypto.subtle.exportKey('jwk', aliceKeyPair.publicKey)
		const bobJwk = await crypto.subtle.exportKey('jwk', bobKeyPair.publicKey)
		const sharedKeyAB = await deriveKey(aliceKeyPair.publicKey, bobKeyPair.privateKey)

		// client A encrypts
		const payload: PostChatTextMessagePayload = {
			type: ChatMessageType.Text,
			content: 'hi B',
		}
		const encryptedPayload = await encryptChatMessage(payload, sharedKeyAB)
		const ivArray = new Uint8Array(encryptedPayload.e2e!.iv)

		const encryptedMessage: EncryptedClientTextChatMessage<string> = {
			...encryptedPayload,
			type: payload.type,
			content: Buffer.from(encryptedPayload.content).toString('base64'),
			e2e: { iv: Buffer.from(ivArray).toString('base64') },
			id: 'msg1',
			sender: 'A',
			sentAt: new Date().toISOString(),
		}

		const chat: EncryptedClientChat = {
			id: 'conv1',
			participants: [
				{ id: 'A', username: 'A', publicKey: aliceJwk },
				{ id: 'B', username: 'B', publicKey: bobJwk },
			],
			wasRequestedToDelete: false,
			lastMessage: encryptedMessage,
		}

		// B decrypts single chat
		const decryptedChat = await decryptChat(chat, 'B', bobKeyPair.privateKey)
		expect(decryptedChat.lastMessage!.content).toBe('hi B')
		expect(decryptedChat.sharedKey).toBeDefined()

		// B decrypts array of chats
		const decryptedArray = await decryptChats([chat], 'B', bobKeyPair.privateKey)
		expect(decryptedArray).toHaveLength(1)
		expect(decryptedArray[0].lastMessage!.content).toBe('hi B')
	})
})