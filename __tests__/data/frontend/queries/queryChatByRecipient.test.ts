import { queryChatByRecipient } from "@/data/frontend/queries/queryChatByRecipient"
import type { Api } from "@/utils/frontend/api"
import type { ClientChat, EncryptedClientChat } from "@/data/types/chats"

jest.mock("@/data/frontend/fetches/getChatByRecipient")
jest.mock("@/utils/frontend/e2e/chat")

import { getChatByRecipient } from "@/data/frontend/fetches/getChatByRecipient"
import { decryptChat } from "@/utils/frontend/e2e/chat"

const mockedGetChatByRecipient = getChatByRecipient as jest.MockedFunction<typeof getChatByRecipient>
const mockedDecryptChat = decryptChat as jest.MockedFunction<typeof decryptChat>

describe("queryChatByRecipient", () => {
	const recipientId = "user2"
	const fakeApi = {
		fetch: jest.fn(),
		user: { id: "user1" },
		uek: { privateKey: {} as CryptoKey },
	} as unknown as Api

	afterEach(() => {
		jest.resetAllMocks()
	})

	it("throws if api.user or api.uek is missing", async () => {
		// prepare mock to bypass user check
		mockedGetChatByRecipient.mockResolvedValue({} as EncryptedClientChat)

		const missingUser = { uek: fakeApi.uek } as unknown as Api
		const missingKey = { user: fakeApi.user } as unknown as Api

		await expect(queryChatByRecipient(missingUser, recipientId)).rejects.toThrow("User or key not found")
		await expect(queryChatByRecipient(missingKey, recipientId)).rejects.toThrow("User or key not found")

		// getChatByRecipient called both times
		expect(mockedGetChatByRecipient).toHaveBeenCalledTimes(0)
	})

	it("fetches chat by recipient, decrypts it, and returns decrypted data", async () => {
		const fakeEncrypted: EncryptedClientChat = {
			id: "chat123",
			participants: [],
			wasRequestedToDelete: false,
		} as EncryptedClientChat
		const fakeDecrypted: ClientChat & { sharedKey: CryptoKey } = {
			id: "chat123",
			participants: [],
			sharedKey: {} as CryptoKey,
			wasRequestedToDelete: false,
		}

		mockedGetChatByRecipient.mockResolvedValueOnce(fakeEncrypted)
		mockedDecryptChat.mockResolvedValueOnce(fakeDecrypted)

		const result = await queryChatByRecipient(fakeApi, recipientId)

		expect(mockedGetChatByRecipient).toHaveBeenCalledWith(fakeApi, recipientId)
		expect(mockedDecryptChat).toHaveBeenCalledWith(
			fakeEncrypted,
			fakeApi.user!.id,
			fakeApi.uek!.privateKey,
		)
		expect(result).toEqual(fakeDecrypted)
	})
})
