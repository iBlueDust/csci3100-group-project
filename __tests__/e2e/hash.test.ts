import { hash, HashAlgorithm } from "@/utils/frontend/e2e"

function bufferToHex(buffer: ArrayBuffer): string {
	return Array.from(new Uint8Array(buffer))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('')
}

describe('hash', () => {
	it('computes SHA-256 by default', async () => {
		const result = await hash('hello world')
		const hex = bufferToHex(result)
		expect(hex).toBe(
			'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
		)
	})

	it('computes SHA-1', async () => {
		const result = await hash('hello world', HashAlgorithm.SHA1)
		const hex = bufferToHex(result)
		expect(hex).toBe('2aae6c35c94fcfb415dbe95f408b9ce91ee846ed')
	})

	it('computes SHA-384 of "hello world"', async () => {
		const result = await hash('hello world', HashAlgorithm.SHA384)
		const hex = bufferToHex(result)
		expect(hex).toBe(
			'fdbd8e75a67f29f701a4e040385e2e23986303ea10239211af907fcbb83578b3e417cb71ce646efd0819dd8c088de1bd'
		)
	})

	it('computes SHA-512 of "hello world"', async () => {
		const result = await hash('hello world', HashAlgorithm.SHA512)
		const hex = bufferToHex(result)
		expect(hex).toBe(
			'309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f'
		)
	})

	it('computes SHA-256 of empty string', async () => {
		const result = await hash('')
		const hex = bufferToHex(result)
		expect(hex).toBe(
			'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
		)
	})

	it('accepts Uint8Array input', async () => {
		const encoder = new TextEncoder()
		const data = encoder.encode('abc')
		const result = await hash(data, HashAlgorithm.SHA256)
		const hex = bufferToHex(result)
		expect(hex).toBe(
			'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
		)
	})
})