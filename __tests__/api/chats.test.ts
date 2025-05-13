// __tests__/api/chats.index.test.ts
/**
 * @jest-environment node
 */

// Silence all console.error calls:
jest.spyOn(console, 'error').mockImplementation(() => { })


// Stub out auth wrapper *before* anything else
jest.mock('@/utils/api/auth', () => ({
  // protectedRoute simply returns the handler, injecting a fake session
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protectedRoute: (fn: any) => (req: any, res: any) =>
    fn(req, res, {
      data: { userId: 'test-user', roles: ['user'] },
    }),
}))

// Stub the session store so protectedRoute won't try real Redis/Mongo
jest.mock('@/data/api/session', () => {
  const { InMemorySessionStore } = jest.requireActual('@/data/api/session')
  return { sessionStore: new InMemorySessionStore() }
})

// Stub next-auth if handler calls getServerSession directly
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: { id: 'test-user', email: 'test@example.com' },
    expires: 'never',
  }),
}))

// Now import everything else
import { testApiHandler } from 'next-test-api-route-handler'
import handler from '@/pages/api/chats/index'
import * as chatQueries from '@/data/api/mongo/queries/chats/getRecentChats'

// mock only the DB query
jest.mock('@/data/api/mongo/queries/chats/getRecentChats')

describe('GET /api/chats (integration-style)', () => {
  beforeEach(() => jest.resetAllMocks())

  it('200 + returns stubbed chats', async () => {
    const fake = [{ id: '1' }, { id: '2' }]
      ; (chatQueries.getRecentChats as jest.Mock).mockResolvedValue({ data: fake, meta: {} })

    await testApiHandler({
      pagesHandler: handler,   // <-- pagesHandler, not handler
      url: '/api/chats',
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' })
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.data).toEqual(fake)
        expect(chatQueries.getRecentChats).toHaveBeenCalledWith(
          'test-user',
          expect.objectContaining({ skip: 0, limit: 10 })
        )
      },
    })
  })

  it('500 on DB error', async () => {
    ; (chatQueries.getRecentChats as jest.Mock).mockRejectedValue(new Error('boom'))

    await testApiHandler({
      pagesHandler: handler,
      url: '/api/chats',
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' })
        expect(res.status).toBe(500)
      },
    })
  })
})
