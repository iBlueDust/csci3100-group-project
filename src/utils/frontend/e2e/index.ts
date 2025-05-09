export { hash, HashAlgorithm } from './hash'

export type UserEncryptionKey = CryptoKeyPair

const algorithm = { name: 'ECDH', namedCurve: 'P-521' }

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
	keyUsages: KeyUsage[] = [],
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

export async function generateRandomKeyPair(
	extractable: boolean = true,
	keyUsages: KeyUsage[] = ['deriveKey', 'deriveBits'],
): Promise<CryptoKeyPair> {
	return await crypto.subtle.generateKey(
		algorithm,
		extractable,
		keyUsages,
	)
}

export async function encryptMessage(
	message: Uint8Array<ArrayBufferLike>,
	sharedKey: CryptoKey,
	iv: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(16)),
) {
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


const AES_IV_SIZE = 12

function decodeEncryptedUserEncryptionKeyFormat(
	encodedEncryptedKey: ArrayBuffer,
): { version: number; iv: Uint8Array; encryptedKeyPkcs8: Uint8Array } {
	if (encodedEncryptedKey.byteLength < 8) {
		throw new Error('Encrypted user encryption key is too short')
	}


	const header = new Uint32Array(encodedEncryptedKey.slice(0, 8))
	const [version, ivLength] = header
	if (version !== 1 || ivLength !== AES_IV_SIZE) {
		throw new Error('Unsupported encrypted user encryption key version')
	}

	const iv = new Uint8Array(encodedEncryptedKey.slice(8, 8 + AES_IV_SIZE))
	const encryptedKeyPkcs8 = new Uint8Array(
		encodedEncryptedKey.slice(8 + AES_IV_SIZE)
	)
	return { version, iv, encryptedKeyPkcs8 }
}


export async function decryptUserEncryptionKey(
	encryptedUek: ArrayBuffer,
	decryptionKey: CryptoKey,
): Promise<CryptoKey> {
	const { iv, encryptedKeyPkcs8 } = decodeEncryptedUserEncryptionKeyFormat(
		encryptedUek,
	)

	const decryptedUek = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv },
		decryptionKey,
		encryptedKeyPkcs8,
	)

	return await crypto.subtle.importKey(
		'pkcs8',
		decryptedUek,
		algorithm,
		true,
		['deriveBits', 'deriveKey'],
	)
}

function encodeEncryptedUserEncryptionKeyFormat(
	encryptedKey: ArrayBuffer,
	iv: ArrayBuffer,
): ArrayBuffer {
	const version = 1
	const header = new Uint32Array([version, AES_IV_SIZE])
	return concatArrayBuffers(
		header.buffer,
		iv,
		encryptedKey,
	)
}

export async function encryptUserEncryptionKey(
	uek: CryptoKey,
	encryptionKey: CryptoKey,
): Promise<ArrayBuffer> {
	const iv = crypto.getRandomValues(new Uint8Array(AES_IV_SIZE))
	const uekBuffer = await crypto.subtle.exportKey('pkcs8', uek)
	const encryptedUek = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		encryptionKey,
		uekBuffer,
	)

	return encodeEncryptedUserEncryptionKeyFormat(encryptedUek, iv.buffer)
}

function concatArrayBuffers(
	...buffers: ArrayBuffer[]
): ArrayBuffer {
	const totalLength = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0)
	const result = new Uint8Array(totalLength)
	let offset = 0
	for (const buffer of buffers) {
		result.set(new Uint8Array(buffer), offset)
		offset += buffer.byteLength
	}
	return result.buffer
}