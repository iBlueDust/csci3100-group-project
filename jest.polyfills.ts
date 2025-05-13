// jest.polyfills.ts
import { TextEncoder, TextDecoder } from 'util'
import { webcrypto } from 'crypto'
import fetch from 'cross-fetch'


globalThis.TextEncoder = TextEncoder
// @ts-expect-error Polyfills for jest tests on browser APIs
globalThis.TextDecoder = TextDecoder

Object.defineProperty(globalThis, 'crypto', { value: webcrypto })
Object.defineProperty(globalThis.crypto, 'subtle', { value: webcrypto.subtle })
if (window) {
	Object.defineProperty(window, 'crypto', { value: webcrypto })
	Object.defineProperty(window.crypto, 'subtle', { value: webcrypto.subtle })
}

globalThis.fetch = fetch

if (!globalThis.self) {
	// @ts-expect-error yes
	globalThis.self = globalThis
}