// __tests__/e2e/kdf.test.ts
import { webcrypto } from 'crypto'

import { generateDeterministicSymmetricKey } from '@/utils/frontend/e2e/kdf'

describe('generateDeterministicSymmetricKey', () => {
  it('returns something', async () => {
    const key = await generateDeterministicSymmetricKey('secret', 'salt', ['encrypt'])
    expect(key).toBeDefined()
  })

  it('is deterministic', async () => {
    const secret = 'secret'
    const salt = 'salt'
    const key1 = await generateDeterministicSymmetricKey(secret, salt)
    const key2 = await generateDeterministicSymmetricKey(secret, salt)

    const key1Bytes = await webcrypto.subtle.exportKey('raw', key1)
    const key2Bytes = await webcrypto.subtle.exportKey('raw', key2)

    expect(key1Bytes.byteLength).toBeGreaterThan(0)
    expect(Buffer.from(key1Bytes).equals(Buffer.from(key2Bytes))).toBe(true)
  })

  it('returns different keys for different secrets', async () => {
    const salt = 'salt'
    const key1 = await generateDeterministicSymmetricKey('secret1', salt)
    const key2 = await generateDeterministicSymmetricKey('secret2', salt)

    const key1Bytes = await webcrypto.subtle.exportKey('raw', key1)
    const key2Bytes = await webcrypto.subtle.exportKey('raw', key2)

    expect(key1Bytes.byteLength).toBeGreaterThan(0)
    expect(Buffer.from(key1Bytes).equals(Buffer.from(key2Bytes))).toBe(false)
  })

  it('returns different keys for different secrets', async () => {
    const salt = 'salt'
    const key1 = await generateDeterministicSymmetricKey('secret1', salt)
    const key2 = await generateDeterministicSymmetricKey('secret2', salt)

    const key1Bytes = await webcrypto.subtle.exportKey('raw', key1)
    const key2Bytes = await webcrypto.subtle.exportKey('raw', key2)

    expect(Buffer.from(key1Bytes).equals(Buffer.from(key2Bytes))).toBe(false)
  })


  it('can be used to encrypt AES-GCM', async () => {
    const key = await generateDeterministicSymmetricKey('secret', 'salt', ['encrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(16))
    const plaintext = new TextEncoder().encode('hello world')
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext,
    )

    expect(ciphertext.byteLength).toBeGreaterThan(0)
    expect(Buffer.from(ciphertext).equals(Buffer.from(plaintext))).toBe(false)
  })

  it('can be used to decrypt AES-GCM', async () => {
    const key = await generateDeterministicSymmetricKey('secret', 'salt', ['encrypt', 'decrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(16))
    const plaintext = new TextEncoder().encode('hello world')
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext,
    )

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
    )
    expect(decrypted.byteLength).toBe(plaintext.byteLength)
    expect(new TextDecoder().decode(decrypted)).toBe('hello world')
  })

  it('obeys keyUsages restriction', async () => {
    const key = await generateDeterministicSymmetricKey('secret', 'salt', ['decrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(16))
    const plaintext = new TextEncoder().encode('hello world')
    await expect(crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext,
    )).rejects.toThrow()
  })
})