// jest.polyfills.ts
import { TextEncoder, TextDecoder } from 'util'
import { webcrypto } from 'crypto'

globalThis.TextEncoder = TextEncoder
// @ts-expect-error Polyfills for jest tests on browser APIs
globalThis.TextDecoder = TextDecoder


// Has to be defined indirectly for crypto.subtle to be defined for some reason.
const boundWebCrypto = {
	subtle: {
		encrypt: webcrypto.subtle.encrypt.bind(webcrypto.subtle),
		decrypt: webcrypto.subtle.decrypt.bind(webcrypto.subtle),
		exportKey: webcrypto.subtle.exportKey.bind(webcrypto.subtle),
		importKey: webcrypto.subtle.importKey.bind(webcrypto.subtle),
		deriveKey: webcrypto.subtle.deriveKey.bind(webcrypto.subtle),
		generateKey: webcrypto.subtle.generateKey.bind(webcrypto.subtle),
		digest: webcrypto.subtle.digest.bind(webcrypto.subtle),
	},
	getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
}

Object.defineProperty(globalThis, 'crypto', { value: boundWebCrypto })
Object.defineProperty(window, 'crypto', { value: boundWebCrypto })

if (!globalThis.self) {
	// @ts-expect-error yes
	globalThis.self = globalThis
}