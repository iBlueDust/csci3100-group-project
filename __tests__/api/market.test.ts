// import { testApiHandler } from 'next-test-api-route-handler'
// import handler from '@/pages/api/market/listings'
// import { parseFormDataBody } from '@/utils/api'
// import { putManyObjects } from '@/data/api/minio'
// import dbConnect from '@/data/api/mongo'
// import MarketListing from '@/data/api/mongo/models/market-listing'

// // 1) Mock everything under utils/api
// jest.mock('@/utils/api', () => ({
//   parseFormDataBody: jest.fn(),
//   generateMinioObjectName: jest.fn(() => 'fake-object-name'),
//   assertIsObjectId: jest.fn((x) => x),
// }))

// // 2) Mock Minio + Mongo + Mongoose model
// jest.mock('@/data/api/minio',        () => ({ putManyObjects: jest.fn() }))
// jest.mock('@/data/api/mongo',        () => jest.fn())
// jest.mock('@/data/api/mongo/models/market-listing', () => {
//   function ML(this: any) { /* pretend it got _id from Mongo */ }
//   ML.prototype.save = jest.fn().mockResolvedValue(undefined)
//   // ensure listing.id exists
//   Object.defineProperty(ML.prototype, 'id', {
//     get() { return 'FAKE_ID' },
//   })
//   return ML
// })

// // 3) Bypass auth entirely
// jest.mock('@/utils/api/auth', () => ({
//   protectedRoute: (fn: any) =>
//     // ignore sessionStore; always inject a fake user
//     (req: any, res: any) => fn(req, res, { data: { userId: 'u1', roles: ['user'] } }),
// }))

// describe('POST /api/market/listings', () => {
//   beforeEach(() => {
//     // reset all mocks and any queued mockResolvedValueOnce
//     jest.resetAllMocks()
//   })

//   it('returns 400 on invalid form', async () => {
//     ;(parseFormDataBody as jest.Mock).mockResolvedValueOnce({
//       fields: {},
//       error: new Error('parse failed'),
//     })

//     await testApiHandler({
//       pagesHandler: handler,
//       url: '/api/market/listings',
//       method: 'POST',
//       test: async ({ fetch }) => {
//         const res = await fetch({ method: 'POST', body: 'ignored' })
//         expect(res.status).toBe(400)
//         expect(await res.json()).toEqual({
//           code: 'INVALID_REQUEST',
//           message: 'Invalid form data',
//         })
//       },
//     })
//   })

//   it('returns 200 + new id when successful', async () => {
//     // 1) parseFormDataBody succeeds
//     ;(parseFormDataBody as jest.Mock).mockResolvedValueOnce({
//       fields: {
//         title:       ['My item'],
//         description: ['Desc'],
//         pictures: [{
//           data:     Buffer.from(''),
//           size:     123,
//           filename: 'a.png',
//           mimetype: 'image/png',
//           encoding: '7bit',
//         }],
//         priceInCents: ['500'],
//         countries:    ['us'],
//         categories:   ['books'],
//       },
//       error: null,
//     })

//     // 2) pretend uploads + DB connect succeed
//     ;(putManyObjects as jest.Mock).mockResolvedValueOnce({ success: true })
//     ;(dbConnect      as jest.Mock).mockResolvedValueOnce(undefined)

//     // 3) our ML.prototype.save is already a stub, and id getter returns "FAKE_ID"

//     await testApiHandler({
//       pagesHandler: handler,
//       url: '/api/market/listings',
//       method: 'POST',
//       test: async ({ fetch }) => {
//         const res = await fetch({ method: 'POST', body: 'ignored' })
//         expect(res.status).toBe(200)
//         expect(await res.json()).toEqual({ id: 'FAKE_ID' })
//       },
//     })
//   })
// })


import { testApiHandler } from 'next-test-api-route-handler'
import handler from '@/pages/api/market/listings'
import { parseFormDataBody } from '@/utils/api'
import { putManyObjects } from '@/data/api/minio'
import dbConnect from '@/data/api/mongo'

// 1) Mock utils/api + helpers
jest.mock('@/utils/api', () => ({
  parseFormDataBody: jest.fn(),
  generateMinioObjectName: jest.fn(() => 'fake-object-name'),
  assertIsObjectId: jest.fn((x) => x),
}))

// 2) Mock Minio + Mongo + Mongoose model
jest.mock('@/data/api/minio', () => ({ putManyObjects: jest.fn() }))
jest.mock('@/data/api/mongo', () => jest.fn())
jest.mock('@/data/api/mongo/models/market-listing', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function ML(this: any) { }
  ML.prototype.save = jest.fn().mockResolvedValue(undefined)
  Object.defineProperty(ML.prototype, 'id', { get: () => 'FAKE_ID' })
  return ML
})

// 3) Bypass auth
jest.mock('@/utils/api/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protectedRoute: (fn: any) => (req: any, res: any) =>
    fn(req, res, { data: { userId: 'u1', roles: ['user'] } }),
}))

describe('POST /api/market/listings', () => {
  beforeAll(() => {
    // suppress console output during tests
    jest.spyOn(console, 'warn').mockImplementation(() => { })
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })

  afterAll(() => {
    // restore the original implementations
    (console.warn as jest.Mock).mockRestore();
    (console.log as jest.Mock).mockRestore()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns 400 on invalid form', async () => {
    ; (parseFormDataBody as jest.Mock).mockResolvedValueOnce({
      fields: {},
      error: new Error('parse failed'),
    })

    await testApiHandler({
      pagesHandler: handler,
      url: '/api/market/listings',
      test: async ({ fetch }) => {
        // specify method & body here
        const res = await fetch({ method: 'POST', body: 'ignored' })
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({
          code: 'INVALID_REQUEST',
          message: 'Invalid form data',
        })
      },
    })
  })

  it('returns 200 + new id when successful', async () => {
    // a) parsing succeeds
    ; (parseFormDataBody as jest.Mock).mockResolvedValueOnce({
      fields: {
        title: ['My item'],
        description: ['Desc'],
        pictures: [{
          data: Buffer.from(''),
          size: 123,
          filename: 'a.png',
          mimetype: 'image/png',
          encoding: '7bit',
        }],
        priceInCents: ['500'],
        countries: ['us'],
        categories: ['books'],
      },
      error: null,
    })

      // b) Minio + DB connect succeed
      ; (putManyObjects as jest.Mock).mockResolvedValueOnce({ success: true })
      ; (dbConnect as jest.Mock).mockResolvedValueOnce(undefined)

    // c) save() stub and id is always "FAKE_ID"

    await testApiHandler({
      pagesHandler: handler,
      url: '/api/market/listings',
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'POST', body: 'ignored' })
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({ id: 'FAKE_ID' })
      },
    })
  })
})
