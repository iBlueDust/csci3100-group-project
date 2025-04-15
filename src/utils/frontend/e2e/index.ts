import env from '@/utils/frontend/env'
import { ab2hex, hex2base64url } from '@/utils'

export enum HashAlgorithm {
	/**
	 * Not for cryptographic use
	 */
	SHA1 = 'SHA-1',

	SHA256 = 'SHA-256',
	SHA384 = 'SHA-384',
	SHA512 = 'SHA-512',
}

export async function hash(
	value: string | Uint8Array | ArrayBuffer,
	algorithm: HashAlgorithm = HashAlgorithm.SHA256
): Promise<ArrayBuffer> {
	if (typeof value === 'string') {
		// Convert string to Buffer using utf-8 encoding
		const encoder = new TextEncoder()
		value = encoder.encode(value)
	}
	return await window.crypto.subtle.digest(algorithm, value)
}

export type UserEncryptionKey = CryptoKeyPair

export async function generateUserEncryptionKey(username: string, password: string): Promise<UserEncryptionKey> {
	const uekMaterial = Buffer.concat([
		new TextEncoder().encode(username),
		new Uint8Array([0xff]),
		new TextEncoder().encode(password),
		new TextEncoder().encode(env.NEXT_PUBLIC_UEK_DERIVATION_SALT),
	])
	return await generateDeterministicKeys(uekMaterial)
}

// https://www.keithbartholomew.com/blog/posts/2024-01-22-webcrypto-diffie-hellman

const algorithm = { name: 'ECDH', namedCurve: 'P-521' }

/**
 * @param userDerivationKey Must be a Uint8Array of 32 bytes or more
 */
export async function generateDeterministicKeys(
	seed: Uint8Array<ArrayBufferLike>,
): Promise<CryptoKeyPair> {
	// Generate 128-bit hash of the seed
	const seedHash1 = await hash(seed, HashAlgorithm.SHA512)
	const seed2 = new Uint8Array([...new Uint8Array(seedHash1), ...seed])
	const seedHash2 = await hash(seed2, HashAlgorithm.SHA512)
	// Pick the first 66 bytes
	const seedHashHex = ab2hex(seedHash2.slice(0, 66)).padStart(66 * 2, '0')

	// Dynamically load elliptic
	const elliptic = (await import('elliptic')).default
	const ec = new elliptic.ec('p521')
	const key = ec.keyFromPrivate(seedHashHex, 'hex')
	const publicKeyPoint = key.getPublic()

	const xHex = publicKeyPoint.getX().toString('hex').padStart(66 * 2, '0')
	const yHex = publicKeyPoint.getY().toString('hex').padStart(66 * 2, '0')

	const publicJwk = {
		kty: 'EC',
		crv: 'P-521',
		x: hex2base64url(xHex),
		y: hex2base64url(yHex),
		ext: true,
	}
	const privateJwk = {
		...publicJwk,
		d: hex2base64url(seedHashHex),
	}

	const keypair: Partial<CryptoKeyPair> = {}

	await Promise.all([
		crypto.subtle.importKey(
			'jwk',
			privateJwk,
			algorithm,
			true,
			['deriveKey', 'deriveBits'],
		).then(key => {
			keypair.privateKey = key
		}),
		crypto.subtle.importKey(
			'jwk',
			publicJwk,
			algorithm,
			true,
			[],
		).then(key => {
			keypair.publicKey = key
		}),
	])

	return keypair as CryptoKeyPair
}

export async function exportKey(
	key: CryptoKey,
	format?: 'jwk',
): Promise<JsonWebKey>
export async function exportKey(
	key: CryptoKey,
	format: Exclude<KeyFormat, 'jwk'>,
): Promise<ArrayBuffer>
export async function exportKey(
	key: CryptoKey,
	format: KeyFormat = 'jwk',
): Promise<ArrayBuffer | JsonWebKey> {
	return await crypto.subtle.exportKey(format, key)
}

export async function importKey(
	encodedKey: JsonWebKey,
	format?: 'jwk',
	keyUsages?: KeyUsage[],
): Promise<CryptoKey>
export async function importKey(
	encodedKey: BufferSource,
	format: Exclude<KeyFormat, 'jwk'>,
	keyUsages?: KeyUsage[],
): Promise<CryptoKey>
export async function importKey(
	encodedKey: BufferSource | JsonWebKey,
	format: KeyFormat = 'jwk',
	keyUsages: KeyUsage[] = ['deriveKey'],
): Promise<CryptoKey> {
	const extractable = true
	return await crypto.subtle.importKey(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		format as any,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		encodedKey as any,
		algorithm,
		extractable,
		keyUsages,
	)
}

export async function deriveKey(
	theirPublicKey: CryptoKey,
	myPrivateKey: CryptoKey,
): Promise<CryptoKey> {
	const algorithm = { name: 'ECDH', public: theirPublicKey }
	const derivedKeyAlgorithm = { name: 'AES-GCM', length: 256 }
	const exportable = true
	const keyUsages = ['encrypt', 'decrypt'] as const

	return await crypto.subtle.deriveKey(
		algorithm,
		myPrivateKey,
		derivedKeyAlgorithm,
		exportable,
		keyUsages,
	)
}

export async function encryptMessage(
	message: Uint8Array<ArrayBufferLike>,
	sharedKey: CryptoKey,
) {
	const iv = crypto.getRandomValues(new Uint8Array(16))
	const ciphertext = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		sharedKey,
		message,
	)

	return { iv, ciphertext }
}

export async function decryptMessage(
	ciphertext: ArrayBuffer,
	iv: Uint8Array<ArrayBufferLike>,
	sharedKey: CryptoKey,
) {
	const decrypted = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv },
		sharedKey,
		ciphertext,
	)

	return decrypted
}