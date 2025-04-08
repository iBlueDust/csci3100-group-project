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
): Promise<string> {
	if (typeof value === 'string') {
		// Convert string to Buffer using utf-8 encoding
		const encoder = new TextEncoder()
		value = encoder.encode(value)
	}
	const hashed = await window.crypto.subtle.digest(algorithm, value)
	const hashArray = Array.from(new Uint8Array(hashed))
	const hashBase64 = btoa(String.fromCharCode(...hashArray))
	return hashBase64
}