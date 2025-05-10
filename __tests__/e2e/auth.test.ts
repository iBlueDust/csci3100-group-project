import { toPasskey } from '@/utils/frontend/e2e/auth'
import { hash } from '@/utils/frontend/e2e'
import { ab2base64 } from '@/utils'

// src/utils/frontend/e2e/auth.test.ts


jest.mock('@/utils/frontend/e2e/hash', () => ({
	hash: jest.fn(),
}))

jest.mock('@/utils', () => ({
	ab2base64: jest.fn(),
}))

describe('toPasskey', () => {
	const fakeBuffer = new TextEncoder().encode('fake-hash').buffer

	beforeEach(() => {
		; (hash as jest.Mock).mockResolvedValue(fakeBuffer)
			; (ab2base64 as jest.Mock).mockReturnValue('ZmFrZS1iYXNlNjQ=')
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	it('hashes "username:password" and encodes it with ab2base64', async () => {
		const username = 'alice'
		const password = 's3cr3t'
		const result = await toPasskey(username, password)

		expect(hash).toHaveBeenCalledTimes(1)
		expect(hash).toHaveBeenCalledWith('alice:s3cr3t')
		expect(ab2base64).toHaveBeenCalledTimes(1)
		expect(ab2base64).toHaveBeenCalledWith(fakeBuffer)
		expect(result).toBe('ZmFrZS1iYXNlNjQ=')
	})

	it('handles empty username or password', async () => {
		await toPasskey('', 'onlypass')
		expect(hash).toHaveBeenCalledWith(':onlypass')

		await toPasskey('onlyuser', '')
		expect(hash).toHaveBeenCalledWith('onlyuser:')
	})

	it('propagates hash errors', async () => {
		const err = new Error('hash failure')
			; (hash as jest.Mock).mockRejectedValueOnce(err)
		await expect(toPasskey('u', 'p')).rejects.toThrow('hash failure')
	})

	it('propagates ab2base64 errors', async () => {
		; (hash as jest.Mock).mockResolvedValue(fakeBuffer)
		const err = new Error('encode failure')
			; (ab2base64 as jest.Mock).mockImplementationOnce(() => {
				throw err
			})
		await expect(toPasskey('u2', 'p2')).rejects.toThrow('encode failure')
	})
})