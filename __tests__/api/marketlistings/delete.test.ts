import { testApiHandler } from 'next-test-api-route-handler'
import handler from '@/pages/api/market/listings/[id]'

// Mock out auth so we can invoke PATCH/DELETE without real sessions
jest.mock('@/utils/api/auth', () => ({
  protectedRoute: (fn: any) => (req: any, res: any) =>
    fn(req, res, { data: { userId: 'test-user', roles: ['user'] } }),
}))

// Stub out mongoose connect
jest.mock('@/data/db/mongo', () => jest.fn())

// Stub out Joi custom validator so it always passes
jest.mock('@/utils/api', () => ({
  assertIsObjectId: jest.fn((x) => x),
}))

// Mock MarketListing model export, with deleteOne as a jest.fn()
jest.mock('@/data/db/mongo/models/market-listing', () => ({
  __esModule: true,
  default: {
    deleteOne: jest.fn(),
  },
}))

import MarketListing from '@/data/db/mongo/models/market-listing'

describe('DELETE /api/market/listings/[id]', () => {
  const VALID_ID = '507f1f77bcf86cd799439011'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('404 when nothing deleted', async () => {
    // simulate no document deleted
    ;(MarketListing.deleteOne as jest.Mock).mockResolvedValueOnce({
      deletedCount: 0,
    })

    await testApiHandler({
      pagesHandler: handler,
      url: `/api/market/listings/${VALID_ID}`,
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
    // simulate one document deleted
    ;(MarketListing.deleteOne as jest.Mock).mockResolvedValueOnce({
      deletedCount: 1,
    })

    await testApiHandler({
      pagesHandler: handler,
      url: `/api/market/listings/${VALID_ID}`,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'DELETE' })
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({ success: true })
      },
    })
  })
})
