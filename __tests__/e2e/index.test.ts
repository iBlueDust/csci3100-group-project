import { webcrypto } from 'crypto'

import {
  encryptMessage,
  decryptMessage,
  generateRandomKeyPair,
  deriveKey,
  exportKey,
  importKey,
  encryptUserEncryptionKey,
  decryptUserEncryptionKey,
} from '@/utils/frontend/e2e'

const concatArrayBuffers = (...buffers: ArrayBuffer[]): ArrayBuffer => {
  const total = buffers.reduce((sum, b) => sum + b.byteLength, 0)
  const tmp = new Uint8Array(total)
  let offset = 0
  for (const b of buffers) {
    tmp.set(new Uint8Array(b), offset)
    offset += b.byteLength
  }
  return tmp.buffer
}

describe('encryptMessage / decryptMessage', () => {
  it('can encrypt messages', async () => {
    const message = new TextEncoder().encode('hello world')
    const iv = webcrypto.getRandomValues(new Uint8Array(16))
    const key = await webcrypto.subtle.generateKey(
      { name: 'AES-GCM', length: 128 },
      true,
      ['encrypt', 'decrypt'],
    )

    const { ciphertext } = await encryptMessage(new Uint8Array(message), key, iv)

    const decrypted = await webcrypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
    )

    expect(Buffer.from(decrypted).equals(Buffer.from(message))).toBe(true)
    expect(new TextDecoder().decode(decrypted)).toBe('hello world')
  })

  it('can decrypt messages', async () => {
    const message = new TextEncoder().encode('hello world')
    const iv = webcrypto.getRandomValues(new Uint8Array(16))
    const key = await webcrypto.subtle.generateKey(
      { name: 'AES-GCM', length: 128 },
      true,
      ['encrypt', 'decrypt'],
    )

    const ciphertext = await webcrypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new Uint8Array(message),
    )

    const decrypted = await decryptMessage(ciphertext, iv, key)


    expect(Buffer.from(decrypted).equals(Buffer.from(message))).toBe(true)
    expect(new TextDecoder().decode(decrypted)).toBe('hello world')
  })

  it('can encrypt / decrypt in tandem', async () => {
    const message = new TextEncoder().encode('hello world')
    const iv = webcrypto.getRandomValues(new Uint8Array(16))
    const key = await webcrypto.subtle.generateKey(
      { name: 'AES-GCM', length: 128 },
      true,
      ['encrypt', 'decrypt'],
    )

    const { ciphertext } = await encryptMessage(new Uint8Array(message), key, iv)

    expect(Buffer.from(ciphertext).equals(Buffer.from(message))).toBe(false)

    const decrypted = await decryptMessage(ciphertext, iv, key)


    expect(Buffer.from(decrypted).equals(Buffer.from(message))).toBe(true)
    expect(new TextDecoder().decode(decrypted)).toBe('hello world')
  })
})


describe('generateRandomKeyPair / deriveKey', () => {
  it('generates a valid ECDH key pair', async () => {
    const { publicKey, privateKey } = await generateRandomKeyPair()
    expect(publicKey).toBeDefined()
    expect(privateKey).toBeDefined()

    // export the public key to JWK and verify its parameters
    const jwk = await exportKey(publicKey, 'jwk')
    expect(jwk.kty).toBe('EC')
    expect(jwk.crv).toMatch(/P-521/)
  })

  it('derives the same shared secret on both sides', async () => {
    const alice = await generateRandomKeyPair()
    const bob = await generateRandomKeyPair()

    // Alice derives with Bob's public key
    const aliceShared = await deriveKey(bob.publicKey, alice.privateKey)
    // Bob derives with Alice's public key
    const bobShared = await deriveKey(alice.publicKey, bob.privateKey)

    // export both shared keys as raw bytes and compare
    const aBytes = new Uint8Array(await webcrypto.subtle.exportKey('raw', aliceShared))
    const bBytes = new Uint8Array(await webcrypto.subtle.exportKey('raw', bobShared))
    expect(aBytes.byteLength).toBeGreaterThan(0)
    expect(Buffer.from(aBytes).equals(Buffer.from(bBytes))).toBe(true)
  })
})

describe('exportKey / importKey (asymmetric only)', () => {
  // { name: 'ECDH', namedCurve: 'P-521' }

  // ... generate tests

  it('can export and import a public key', async () => {
    const { publicKey } = await generateRandomKeyPair()
    const exported = await exportKey(publicKey, 'jwk')
    const imported = await importKey(exported, 'jwk', [])
    const reExported = await exportKey(imported, 'jwk')
    expect(reExported).toEqual(exported)
  })

  it('can export and import a private key', async () => {
    const { privateKey } = await generateRandomKeyPair()
    const exported = await exportKey(privateKey, 'jwk')
    // Use both usages to match the original
    const imported = await importKey(exported, 'jwk', ['deriveKey', 'deriveBits'])
    const reExported = await exportKey(imported, 'jwk')
    expect(reExported).toEqual(exported)
  })
})

describe('encryptUserEncryptionKey / decryptUserEncryptionKey', () => {
  it('round-trips a private key correctly', async () => {
    // generate an ECDH keypair to encrypt
    const { privateKey } = await generateRandomKeyPair()
    // generate a symmetric AES-GCM key to wrap with
    const wrapKey = await webcrypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )

    // wrap
    const wrapped = await encryptUserEncryptionKey(privateKey, wrapKey)
    expect(wrapped.byteLength).toBeGreaterThan(0)

    // unwrap
    const unwrapped = await decryptUserEncryptionKey(wrapped, wrapKey)
    // export both originals and unwrapped to PKCS8 and compare
    const orig = new Uint8Array(await webcrypto.subtle.exportKey('pkcs8', privateKey))
    const round = new Uint8Array(await webcrypto.subtle.exportKey('pkcs8', unwrapped))
    expect(round).toEqual(orig)
  })
})

describe('decodeEncryptedUserEncryptionKeyFormat', () => {
  const AES_IV_SIZE = 12

  let wrapKey: CryptoKey

  beforeAll(async () => {
    wrapKey = await webcrypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )
  })

  describe('input validation', () => {
    it('throws if buffer is too short', async () => {
      const tooShort = new Uint8Array(7).buffer
      await expect(
        decryptUserEncryptionKey(tooShort, wrapKey),
      ).rejects.toThrow('Encrypted user encryption key is too short')
    })

    it('throws on unsupported version', async () => {
      // version != 1, ivLength = AES_IV_SIZE
      const header = new Uint32Array([2, AES_IV_SIZE]).buffer
      await expect(
        decryptUserEncryptionKey(header, wrapKey),
      ).rejects.toThrow('Unsupported encrypted user encryption key version')
    })

    it('throws on unsupported iv length', async () => {
      // version = 1, ivLength != AES_IV_SIZE
      const header = new Uint32Array([1, AES_IV_SIZE + 1]).buffer
      await expect(
        decryptUserEncryptionKey(header, wrapKey),
      ).rejects.toThrow('Unsupported encrypted user encryption key version')
    })
    // inside __tests__/e2e/index.test.ts, under the existing
    // describe('decodeEncryptedUserEncryptionKeyFormat', () => { … })
  })


  it('correctly decodes and decrypts a valid encoded user encryption key', async () => {
    // generate an ECDH key pair to wrap
    const { privateKey } = await generateRandomKeyPair()
    // export the private key to PKCS8
    const uekBuffer = await webcrypto.subtle.exportKey('pkcs8', privateKey)
    // generate a random IV of the correct length
    const iv = webcrypto.getRandomValues(new Uint8Array(AES_IV_SIZE))
    // encrypt the PKCS8 payload with the wrapKey
    const encryptedUek = await webcrypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      wrapKey,
      uekBuffer,
    )
    // build the encoded buffer: [version, ivLength] + iv + encryptedUek
    const header = new Uint32Array([1, AES_IV_SIZE]).buffer

    const encoded = concatArrayBuffers(header, iv.buffer, encryptedUek)

    // attempt to decode & decrypt using our function
    const resultKey = await decryptUserEncryptionKey(encoded, wrapKey)
    const resultBuffer = await webcrypto.subtle.exportKey('pkcs8', resultKey)

    // the decrypted PKCS8 payload should match the original
    expect(new Uint8Array(resultBuffer)).toEqual(new Uint8Array(uekBuffer))
  })
})

