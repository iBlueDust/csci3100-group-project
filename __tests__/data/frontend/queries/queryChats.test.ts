import { queryChats } from "@/data/frontend/queries/queryChats"
import type { Api } from "@/hooks/useApi"
import type { ClientChat, EncryptedClientChat } from "@/types/chats"
import type { PaginatedResult } from "@/types/common"

jest.mock("@/data/frontend/fetches/getChats")
jest.mock("@/utils/frontend/e2e/chat")

import { getChats } from "@/data/frontend/fetches/getChats"
import { decryptChats } from "@/utils/frontend/e2e/chat"

const mockedGetChats = getChats as jest.MockedFunction<typeof getChats>
const mockedDecrypt = decryptChats as jest.MockedFunction<typeof decryptChats>

describe("queryChats", () => {
	const fakeApi = {
		fetch: jest.fn(),
		user: { id: "user123" },
		uek: { privateKey: {} as CryptoKey },
	} as unknown as Api

	afterEach(() => {
		jest.resetAllMocks()
	})

	it("throws if api.user or api.uek is missing", async () => {
		const incompleteApi1 = {} as Api
		const incompleteApi2 = { user: { id: "u" } } as Api
		await expect(queryChats(incompleteApi1)).rejects.toThrow("User or key not found")
		await expect(queryChats(incompleteApi2)).rejects.toThrow("User or key not found")
	})

	it("fetches chats, decrypts them, and returns decrypted data with meta", async () => {
		const fakeChats = {
			data: [{ id: "c1", lastMessage: [] }],
			meta: { total: 1, skip: 0, limit: 10 },
		} as unknown as PaginatedResult<EncryptedClientChat>
		const fakeDecrypted = [{ id: "c1", lastMessage: [], sharedKey: {} as CryptoKey }]

		mockedGetChats.mockResolvedValueOnce(
			fakeChats as unknown as PaginatedResult<EncryptedClientChat>
		)
		mockedDecrypt.mockResolvedValueOnce(
			fakeDecrypted as unknown as (ClientChat & { sharedKey: CryptoKey })[]
		)

		const result = await queryChats(fakeApi)

		// getChats called with api
		expect(mockedGetChats).toHaveBeenCalledWith(fakeApi)
		// decryptChats called with data, user id, privateKey
		expect(mockedDecrypt).toHaveBeenCalledWith(
			fakeChats.data,
			fakeApi.user!.id,
			fakeApi.uek!.privateKey,
		)
		// result structure
		expect(result).toEqual({
			data: fakeDecrypted,
			meta: fakeChats.meta,
		})
	})
})