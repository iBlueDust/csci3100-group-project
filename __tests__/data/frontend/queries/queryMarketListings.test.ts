import { queryMarketListings } from "@/data/frontend/queries/queryMarketListings"
import type { Api } from "@/hooks/useApi"

describe("queryMarketListings / getMarketListings", () => {
	it("calls api.fetch", () => {
		const fakeBody = { data: [], meta: { total: 0 } }
		const api = {
			fetch: jest.fn().mockResolvedValue({
				ok: true,
				statusText: "",
				json: jest.fn().mockResolvedValue(fakeBody),
			}),
		}
		queryMarketListings(api as unknown as Api)
		expect(api.fetch).toHaveBeenCalled()
	})

	it("sends a fetch request with no parameters by default and returns JSON body", async () => {
		const fakeBody = { data: [], meta: { total: 0 } }
		const api = {
			fetch: jest.fn().mockResolvedValue({
				ok: true,
				statusText: "",
				json: jest.fn().mockResolvedValue(fakeBody),
			}),
		}

		const result = await queryMarketListings(api as unknown as Api)

		expect(api.fetch).toHaveBeenCalled()
		const url = new URL('http://127.0.0.1' + api.fetch.mock.calls[0][0])
		expect(url.pathname).toBe("/market/listings")
		expect(Array.from(url.searchParams.values())).toEqual([])

		expect(result).toEqual(fakeBody)
	})

	it("builds the correct query string when all options are provided", async () => {
		const fakeBody = { data: [{ id: 1 }], total: 1 }
		const api = {
			fetch: jest.fn().mockResolvedValue({
				ok: true,
				statusText: "",
				json: jest.fn().mockResolvedValue(fakeBody),
			}),
		}
		const options = {
			query: "test",
			countries: ["US", "CA"],
			categories: ["cat1"],
			priceMin: 10,
			priceMax: 100,
			author: 'A',
			sort: "price-desc",
			skip: 2,
			limit: 20,
		}

		const result = await queryMarketListings(api as unknown as Api, options)

		expect(api.fetch).toHaveBeenCalled()
		const url = new URL('http://127.0.0.1' + api.fetch.mock.calls[0][0])
		expect(url.pathname).toBe("/market/listings")
		expect(url.searchParams.getAll("query")).toEqual([options.query])
		expect(url.searchParams.getAll("countries")).toEqual(["US,CA"])
		expect(url.searchParams.getAll("categories")).toEqual(options.categories)
		expect(url.searchParams.getAll("priceMin")).toEqual([options.priceMin.toString()])
		expect(url.searchParams.getAll("priceMax")).toEqual([options.priceMax.toString()])
		expect(url.searchParams.getAll("author")).toEqual([options.author])
		expect(url.searchParams.getAll("sort")).toEqual([options.sort])
		expect(url.searchParams.getAll("skip")).toEqual([options.skip.toString()])
		expect(url.searchParams.getAll("limit")).toEqual([options.limit.toString()])
		expect(result).toEqual(fakeBody)
	})

	it("throws an error when response.ok is false", async () => {
		const api = {
			fetch: jest.fn().mockResolvedValue({
				ok: false,
				statusCode: 500,
				json: jest.fn(),
			}),
		}

		await expect(queryMarketListings(api as unknown as Api)).rejects.toThrow()
	})
})