import { testApiHandler } from 'next-test-api-route-handler'
import handler from '@/pages/api/market/listings/[id]'

// bypass auth
jest.mock('@/utils/api/auth', () => ({
  protectedRoute: (fn: any) => (req: any, res: any) =>
    fn(req, res, { data: { userId: 'test-user', roles: ['user'] } }),
}))

// stub dbConnect
jest.mock('@/data/api/mongo', () => jest.fn())

// stub the ObjectId validator
jest.mock('@/utils/api', () => ({
  assertIsObjectId: jest.fn((x) => x),
}))

// mock your model
jest.mock('@/data/api/mongo/models/market-listing', () => ({
  __esModule: true,
  default: { deleteOne: jest.fn() },
}))
import MarketListing from '@/data/api/mongo/models/market-listing'

describe('DELETE /api/market/listings/[id]', () => {
  const VALID_ID = '507f1f77bcf86cd799439011'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('404 when nothing deleted', async () => {
    ;(MarketListing.deleteOne as jest.Mock).mockResolvedValueOnce({
      deletedCount: 0,
    })

    await testApiHandler({
      pagesHandler: handler,
      params: { id: VALID_ID },     // inject req.query.id
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'DELETE' })
        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({
          code: 'NOT_FOUND',
          message: 'Market listing not found',
        })
      },
    })
  })

  it('200 when successfully deleted', async () => {
    ;(MarketListing.deleteOne as jest.Mock).mockResolvedValueOnce({
      deletedCount: 1,
    })

    await testApiHandler({
      pagesHandler: handler,
      params: { id: VALID_ID },     // again
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'DELETE' })
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({ success: true })
      },
    })
  })
})
