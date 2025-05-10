/**
 * @jest-environment node
 */

import { TextEncoder, TextDecoder } from 'util'

// Polyfill TextEncoder/TextDecoder for Node
;(global as any).TextEncoder = TextEncoder
;(global as any).TextDecoder = TextDecoder

describe('generateDeterministicSymmetricKey (mocking crypto.subtle)', () => {
  let stubImportKey: jest.Mock<Promise<CryptoKey>, any>
  let stubDeriveKey: jest.Mock<Promise<CryptoKey>, any>
  let generateDeterministicSymmetricKey: (
    secret: string,
    salt: string,
    usages?: KeyUsage[]
  ) => Promise<CryptoKey>
  const dummyKey = {} as CryptoKey

  beforeAll(() => {
    // 1) stub subtle.importKey
    stubImportKey = jest.fn().mockResolvedValue({} as CryptoKey)
    // 2) stub subtle.deriveKey
    stubDeriveKey = jest.fn().mockResolvedValue(dummyKey)

    // Install our stubs onto global.crypto.subtle
    Object.defineProperty(global, 'crypto', {
      value: {
        subtle: {
          importKey: stubImportKey,
          deriveKey: stubDeriveKey,
        },
      },
      writable: true,
    })
  })

  beforeEach(() => {
    // Reset module registry so require() picks up our stubbed crypto
    jest.resetModules()
    const mod = require('../../src/utils/frontend/e2e/kdf')
    generateDeterministicSymmetricKey = mod.generateDeterministicSymmetricKey
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('calls importKey then deriveKey with correct args and returns the derived key', async () => {
    const usages: KeyUsage[] = ['encrypt', 'decrypt']
    const result = await generateDeterministicSymmetricKey('mySecret', 'mySalt', usages)

    // importKey assertions
    expect(stubImportKey).toHaveBeenCalledTimes(1)
    expect(stubImportKey).toHaveBeenCalledWith(
      'raw',
      expect.any(Uint8Array),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey'],
    )

    // deriveKey assertions
    expect(stubDeriveKey).toHaveBeenCalledTimes(1)
    expect(stubDeriveKey).toHaveBeenCalledWith(
      {
        name:       'PBKDF2',
        salt:       expect.any(Uint8Array),
        iterations: 100000,
        hash:       'SHA-512',
      },
      expect.any(Object),
      { name: 'AES-GCM', length: 256 },
      true,
      usages,
    )

    // return value
    expect(result).toBe(dummyKey)
  })
})
