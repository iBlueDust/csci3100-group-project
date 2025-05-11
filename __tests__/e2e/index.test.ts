// __tests__/e2e/index.test.ts
/** @jest-environment jsdom */
import { encryptMessage, decryptMessage } from '@/utils/frontend/e2e/index'

describe('encryptMessage / decryptMessage', () => {
  let stubEncrypt: jest.Mock<Promise<ArrayBuffer>, any>
  let stubDecrypt: jest.Mock<Promise<ArrayBuffer>, any>
  let stubGetRandomValues: jest.Mock<Uint8Array, any>
  let sharedKey: CryptoKey
  let message: Uint8Array

  // Choose a fixed IV for testing
  const providedIV = new Uint8Array(16).fill(0x42)
  const generatedIV = new Uint8Array(16).fill(0x99)
  const fakeCiphertext = new ArrayBuffer(8)
  const fakePlaintext = new TextEncoder().encode('hello!').buffer

  beforeAll(() => {
    // stub out crypto.subtle.encrypt, decrypt, and getRandomValues
    stubEncrypt = jest.fn().mockResolvedValue(fakeCiphertext)
    stubDecrypt = jest.fn().mockResolvedValue(fakePlaintext)
    stubGetRandomValues = jest.fn().mockReturnValue(generatedIV)

    Object.defineProperty(global, 'crypto', {
      value: {
        subtle: {
          encrypt: stubEncrypt,
          decrypt: stubDecrypt,
        },
        getRandomValues: stubGetRandomValues,
      },
      writable: true,
    })

    sharedKey = {} as CryptoKey  // doesn’t matter, we’ve stubbed the methods
    message = new TextEncoder().encode('test message')
  })

  it('uses the provided IV and returns the ciphertext', async () => {
    const result = await encryptMessage(message, sharedKey, providedIV)

    // ensure encrypt was called with the provided IV
    expect(stubEncrypt).toHaveBeenCalledWith(
      { name: 'AES-GCM', iv: providedIV },
      sharedKey,
      message
    )

    // the function should return exactly { iv, ciphertext }
    expect(result).toEqual({ iv: providedIV, ciphertext: fakeCiphertext })
  })

  it('generates an IV when none is provided', async () => {
    const result = await encryptMessage(message, sharedKey)

    // ensure getRandomValues was called to create a new IV
    expect(stubGetRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array))

    // encrypt should have been called with that generated IV
    expect(stubEncrypt).toHaveBeenCalledWith(
      { name: 'AES-GCM', iv: generatedIV },
      sharedKey,
      message
    )

    // result.iv should be our generatedIV, and ciphertext the stubbed buffer
    expect(result.iv).toBe(generatedIV)
    expect(result.ciphertext).toBe(fakeCiphertext)
  })

  it('decryptMessage calls subtle.decrypt with correct args and returns plaintext', async () => {
    const result = await decryptMessage(fakeCiphertext, providedIV, sharedKey)

    expect(stubDecrypt).toHaveBeenCalledWith(
      { name: 'AES-GCM', iv: providedIV },
      sharedKey,
      fakeCiphertext
    )
    expect(result).toBe(fakePlaintext)
  })
})
