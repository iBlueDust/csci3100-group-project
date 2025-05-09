import { HashAlgorithm } from "./hash"

export async function generateDeterministicSymmetricKey(
	secret: string,
	salt: string,
	keyUsages: KeyUsage[] = ['decrypt'],
): Promise<CryptoKey> {
	const secretBytes = new TextEncoder().encode(secret)
	const saltBytes = new TextEncoder().encode(salt)
	// derive raw symmetric key via PBKDF2
	const secretKey = await crypto.subtle.importKey(
		'raw',
		secretBytes,
		{ name: 'PBKDF2' },
		false,
		['deriveBits', 'deriveKey']
	)
	return await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: saltBytes,
			iterations: 100000,
			hash: HashAlgorithm.SHA512
		},
		secretKey,
		{ name: 'AES-GCM', length: 256 },
		true,
		keyUsages,
	)
}


