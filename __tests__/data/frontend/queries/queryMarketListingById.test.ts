import { queryMarketListingById } from "@/data/frontend/queries/queryMarketListingById"
import type { Api } from "@/hooks/useApi"

describe("queryMarketListingById", () => {
	const TEST_ID = "abc123"

	it("throws if api.user is missing", async () => {
		const fetch = jest.fn()
		const api = { fetch } as unknown as Api
		await expect(queryMarketListingById(api, TEST_ID)).rejects.toThrow(
			"User or key not found"
		)
		expect(fetch).not.toHaveBeenCalled()
	})

	it("calls getMarketListingById and returns its result", async () => {
		const fakeListing = { id: TEST_ID, title: "Test" }

		const fetch = jest.fn()
		const api = { user: { name: "user" }, fetch } as unknown as Api
		fetch.mockResolvedValue({
			ok: true,
			json: async () => fakeListing
		})

		const result = await queryMarketListingById(api, TEST_ID)
		expect(api.fetch).toHaveBeenCalledTimes(1)
		expect(fetch.mock.calls[0][0]).toBe(`/market/listings/${TEST_ID}`)
		expect(fetch.mock.calls[0][1]).toEqual(expect.objectContaining({
			headers: expect.objectContaining({ "Content-Type": "application/json" })
		}))
		expect([undefined, 'GET']).toContain(fetch.mock.calls[0][1].method)
		expect(result).toBe(fakeListing)
	})
})