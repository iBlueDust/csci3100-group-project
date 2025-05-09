// __tests__/e2e/kdf.test.ts
import { generateDeterministicKeyPair } from '@/utils/frontend/e2e/kdf'

describe('generateDeterministicKeyPair (mocking crypto.subtle)', () => {
  let stubImportKey: jest.Mock<Promise<CryptoKey>, any>
  let stubDeriveBits: jest.Mock<Promise<ArrayBuffer>, any>
  let stubExportKey: jest.Mock<Promise<JsonWebKey>, any>

  // Stubs for returned keys
  const dummyPrivateKey = {} as unknown as CryptoKey
  const dummyPublicKey  = {} as unknown as CryptoKey

  // Raw bits returned by deriveBits
  const rawBits = new Uint8Array([1,2,3,4]).buffer

  // A minimal JWK so delete jwk.d won’t crash
  const jwk = { kty:'EC', crv:'P-521', x:'x', y:'y', d:'secret', ext:true } as JsonWebKey

  beforeAll(() => {
    // 1) importKey stub: 
    //    • first call returns a placeholder CryptoKey for PBKDF2 raw import
    //    • second returns dummyPrivateKey for pkcs8 import
    //    • third returns dummyPublicKey for JWK import
    stubImportKey = jest
      .fn()
      .mockResolvedValueOnce({} as CryptoKey)
      .mockResolvedValueOnce(dummyPrivateKey)
      .mockResolvedValueOnce(dummyPublicKey)

    // 2) deriveBits stub
    stubDeriveBits = jest.fn().mockResolvedValue(rawBits)

    // 3) exportKey stub for getPublic()
    stubExportKey = jest.fn().mockResolvedValue(jwk)

    // Inject into global.crypto.subtle
    Object.defineProperty(global, 'crypto', {
      value: {
        subtle: {
          importKey: stubImportKey,
          deriveBits: stubDeriveBits,
          exportKey: stubExportKey,
          deriveKey: jest.fn(),
        }
      },
      writable: true,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('calls importKey, deriveBits, exportKey, and importKey in the right order', async () => {
    const { privateKey, publicKey } = 
      await generateDeterministicKeyPair('secret', 'salt')

    // Check importKey call sequence
    const importCalls = stubImportKey.mock.calls
    expect(importCalls.length).toBe(3)
    expect(importCalls[0][0]).toBe('raw')     // PBKDF2 raw import
    expect(importCalls[1][0]).toBe('pkcs8')   // privateKey import
    expect(importCalls[2][0]).toBe('jwk')     // publicKey import

    // Ensure deriveBits was called exactly once
    expect(stubDeriveBits).toHaveBeenCalledTimes(1)
    // And with the correct algorithm name
    const deriveArgs = stubDeriveBits.mock.calls[0][0] as any
    expect(deriveArgs.name).toBe('PBKDF2')

    // Ensure we exported the privateKey to JWK
    expect(stubExportKey).toHaveBeenCalledWith('jwk', dummyPrivateKey)

    // And the returned keys are exactly our dummies
    expect(privateKey).toBe(dummyPrivateKey)
    expect(publicKey).toBe(dummyPublicKey)
  })
})
