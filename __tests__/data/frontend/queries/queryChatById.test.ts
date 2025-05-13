import { queryChatById } from "@/data/frontend/queries/queryChatById"
import type { Api } from "@/utils/frontend/api"
import type { ClientChat, EncryptedClientChat } from "@/data/types/chats"

jest.mock("@/data/frontend/fetches/getChatById")
jest.mock("@/utils/frontend/e2e/chat")

import { getChatById } from "@/data/frontend/fetches/getChatById"
import { decryptChat } from "@/utils/frontend/e2e/chat"

const mockedGetChatById = getChatById as jest.MockedFunction<typeof getChatById>
const mockedDecryptChat = decryptChat as jest.MockedFunction<typeof decryptChat>

describe("queryChatById", () => {
	const chatId = "chat123"
	const fakeApi = {
		fetch: jest.fn(),
		user: { id: "user1" },
		uek: { privateKey: {} as CryptoKey },
	} as unknown as Api

	afterEach(() => {
		jest.resetAllMocks()
	})

	it("throws if api.user or api.uek is missing", async () => {
		// prepare mock to resolve so function reaches user check
		mockedGetChatById.mockResolvedValue({} as EncryptedClientChat)

		const missingUser = { uek: fakeApi.uek } as unknown as Api
		const missingKey = { user: fakeApi.user } as unknown as Api

		await expect(queryChatById(missingUser, chatId)).rejects.toThrow("User or key not found")
		await expect(queryChatById(missingKey, chatId)).rejects.toThrow("User or key not found")

		// getChatById called in both cases
		expect(mockedGetChatById).toHaveBeenCalledTimes(2)
	})

	it("fetches chat by id, decrypts it, and returns decrypted data", async () => {
		const fakeEncrypted: EncryptedClientChat = {
			id: chatId,
			participants: [],
			wasRequestedToDelete: false,
		} as EncryptedClientChat

		const fakeDecrypted: ClientChat & { sharedKey: CryptoKey } = {
			id: chatId,
			participants: [],
			sharedKey: {} as CryptoKey,
			wasRequestedToDelete: false,
		}

		mockedGetChatById.mockResolvedValueOnce(fakeEncrypted)
		mockedDecryptChat.mockResolvedValueOnce(fakeDecrypted)

		const result = await queryChatById(fakeApi, chatId)

		expect(mockedGetChatById).toHaveBeenCalledWith(fakeApi, chatId)
		expect(mockedDecryptChat).toHaveBeenCalledWith(
			fakeEncrypted,
			fakeApi.user!.id,
			fakeApi.uek!.privateKey,
		)
		expect(result).toEqual(fakeDecrypted)
	})
})
