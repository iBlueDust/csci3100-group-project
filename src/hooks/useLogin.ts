import { base642ab } from "@/utils"
import type { Api } from "@/utils/frontend/api"
import { decryptUserEncryptionKey, importKey } from "@/utils/frontend/e2e"
import { toPasskey } from "@/utils/frontend/e2e/auth"
import { generateDeterministicSymmetricKey } from "@/utils/frontend/e2e/kdf"
import { useMutation } from "@tanstack/react-query"


export interface UseLoginOptions {
	api: Api,
	throwOnError?: boolean
	onSuccess?: () => void
	onError?: (error: Error) => void
}

export enum LoginErrorType {
	UserNotFound = 'USER_NOT_FOUND',
	InvalidCredentials = 'INVALID_CREDENTIALS',
	UnexpectedError = 'UNEXPECTED_ERROR',
}

export class LoginError extends Error {
	constructor(public type: LoginErrorType) {
		super(type)
		this.name = 'LoginError'
	}
}

export const useLogin = ({
	api,
	throwOnError = false,
	onSuccess,
	onError,
}: UseLoginOptions) => {
	const mutation = useMutation({
		mutationFn: async (data: { username: string; password: string }) => {
			const payload = {
				username: data.username,
				passkey: await toPasskey(data.username, data.password),
			}

			const response = await api.fetch('/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (response.status === 404) {
				// 404 Not Found
				throw new LoginError(LoginErrorType.UserNotFound)
			}

			if (response.status === 401) {
				// 401 Unauthorized
				throw new LoginError(LoginErrorType.InvalidCredentials)
			}

			if (!response.ok) {
				throw new LoginError(LoginErrorType.UnexpectedError)
			}

			const body = await response.json()
			console.log('Logged in as user', body.id)

			let uekDecryptionKey: CryptoKey
			try {
				uekDecryptionKey = await generateDeterministicSymmetricKey(
					`${data.username}:${data.password}`,
					process.env.NEXT_PUBLIC_UEK_DERIVATION_SALT ?? data.username,
					['decrypt'],
				)
			} catch (error) {
				console.error('Login: Cannot generate uek decryption key')
				throw error
			}

			const encryptedUekBuffer = base642ab(body.encryptedUserEncryptionKey)

			let uekPrivate: CryptoKey
			try {
				uekPrivate = await decryptUserEncryptionKey(
					encryptedUekBuffer,
					uekDecryptionKey,
				)
			} catch (error) {
				console.error('Login: Cannot decrypt uek')
				throw error
			}
			const uekPublic = await importKey(body.publicKey, 'jwk', [])

			api.setUek({ privateKey: uekPrivate, publicKey: uekPublic })
			api.setUser({
				id: body.id,
				username: data.username,
			})
			api.setTokenExpiresAt(new Date(body.expiresAt))
		},
		throwOnError,
		onSuccess,
		onError,
	})

	return {
		login: mutation.mutateAsync,
		isLoading: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error,
	}
}