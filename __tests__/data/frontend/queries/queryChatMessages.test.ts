import { queryChatMessages } from "@/data/frontend/queries/queryChatMessages"
import { decryptChatMessages } from "@/utils/frontend/e2e/chat"
import type { Api } from "@/hooks/useApi"
import type { EncryptedClientChatMessage, ClientChatMessage } from "@/types/chats"
import type { PaginatedResult, PaginationOptions } from "@/types/common"

jest.mock("@/utils/frontend/e2e/chat")

const mockedDecrypt = decryptChatMessages as jest.MockedFunction<
	typeof decryptChatMessages
>

describe("queryChatMessages", () => {
	const chatId = "chat123"
	const sharedKey = {} as CryptoKey
	let api: Api

	beforeEach(() => {
		api = { fetch: jest.fn() } as unknown as Api
		mockedDecrypt.mockReset()
	})

	it("fetches messages with default params, reverses & decrypts", async () => {
		const encrypted = [
			{ content: "a" },
			{ content: "b" },
			{ content: "c" },
		] as EncryptedClientChatMessage<string>[]
		const meta = { total: 3, skip: 0, limit: 10 }
		const fakePayload: PaginatedResult<
			EncryptedClientChatMessage<string>
		> = {
			data: encrypted.slice(),
			meta,
		}
			; (api.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				statusText: "",
				json: jest.fn().mockResolvedValue(fakePayload),
			})

		const decrypted = [
			{ content: "C" },
			{ content: "B" },
			{ content: "A" },
		] as unknown as ClientChatMessage[]
		mockedDecrypt.mockResolvedValueOnce(decrypted)

		const result = await queryChatMessages(api, chatId, sharedKey)

		expect(api.fetch).toHaveBeenCalledWith(
			`/chats/${chatId}/messages?`,
			{ headers: { "Content-Type": "application/json" } }
		)
		expect(mockedDecrypt).toHaveBeenCalledWith(
			encrypted.slice().reverse(),
			sharedKey
		)
		expect(result).toEqual({ data: decrypted, meta })
	})

	it("includes skip & limit in query params", async () => {
		const options: Partial<PaginationOptions> = { skip: 5, limit: 7 }
		const encrypted = [{ content: "x" }] as EncryptedClientChatMessage<string>[]
		const meta = { total: 1, skip: 5, limit: 7 }
		const fakePayload = { data: encrypted, meta }
			; (api.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				statusText: "",
				json: jest.fn().mockResolvedValue(fakePayload),
			})

		mockedDecrypt.mockResolvedValueOnce([
			{ content: "X" } as unknown as ClientChatMessage
		])

		await queryChatMessages(api, chatId, sharedKey, options)

		const calledUrl = (api.fetch as jest.Mock).mock.calls[0][0] as string
		const url = new URL("http://test" + calledUrl)
		expect(url.pathname).toBe(`/chats/${chatId}/messages`)
		expect(url.searchParams.get("page")).toBe("5")
		expect(url.searchParams.get("limit")).toBe("7")
	})

	it("throws when fetch response is not ok", async () => {
		; (api.fetch as jest.Mock).mockResolvedValue({
			ok: false,
			statusText: "Not Found",
			json: jest.fn(),
		})

		await expect(
			queryChatMessages(api, chatId, sharedKey)
		).rejects.toThrow("Failed to fetch messages Not Found")
	})
})

describe("queryChatMessages", () => {
	const chatId = "chat123"
	const sharedKey = {} as CryptoKey

	let api: Api

	beforeEach(() => {
		api = {
			fetch: jest.fn(),
		} as unknown as Api
		mockedDecrypt.mockReset()
	})

	it("fetches messages with default params, reverses & decrypts", async () => {
		const encrypted = [
			{ content: "a" },
			{ content: "b" },
			{ content: "c" },
		] as EncryptedClientChatMessage<string>[]
		const meta = { total: 3, skip: 0, limit: 10 }
		const fakePayload: PaginatedResult<EncryptedClientChatMessage<string>> = {
			data: encrypted.slice(),
			meta,
		}
			; (api.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				statusText: "",
				json: jest.fn().mockResolvedValue(fakePayload),
			})

		const decrypted = [
			{ content: "C" },
			{ content: "B" },
			{ content: "A" },
		] as unknown as ClientChatMessage[]
		mockedDecrypt.mockResolvedValueOnce(decrypted)

		const result = await queryChatMessages(api, chatId, sharedKey)

		// fetch called correctly
		expect(api.fetch).toHaveBeenCalledWith(
			`/chats/${chatId}/messages?`,
			{ headers: { "Content-Type": "application/json" } }
		)
		// data reversed before decrypt
		expect(mockedDecrypt).toHaveBeenCalledWith(
			encrypted.slice().reverse(),
			sharedKey
		)
		expect(result).toEqual({ data: decrypted, meta })
	})

	it("includes skip & limit in query params", async () => {
		const options: Partial<PaginationOptions> = { skip: 5, limit: 7 }
		const encrypted = [{ content: "x" }] as EncryptedClientChatMessage<string>[]
		const meta = { total: 1, skip: 5, limit: 7 }
		const fakePayload = { data: encrypted, meta }
			; (api.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				statusText: "",
				json: jest.fn().mockResolvedValue(fakePayload),
			})

		mockedDecrypt.mockResolvedValueOnce([
			{ content: "X" } as unknown as ClientChatMessage
		])

		await queryChatMessages(api, chatId, sharedKey, options)

		const calledUrl = (api.fetch as jest.Mock).mock.calls[0][0] as string
		const url = new URL("http://test" + calledUrl)
		expect(url.pathname).toBe(`/chats/${chatId}/messages`)
		expect(url.searchParams.get("page")).toBe("5")
		expect(url.searchParams.get("limit")).toBe("7")
	})

	it("throws when fetch response is not ok", async () => {
		; (api.fetch as jest.Mock).mockResolvedValue({
			ok: false,
			statusText: "Not Found",
			json: jest.fn(),
		})

		await expect(
			queryChatMessages(api, chatId, sharedKey)
		).rejects.toThrow("Failed to fetch messages Not Found")
	})
})