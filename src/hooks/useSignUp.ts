import { useMutation } from "@tanstack/react-query"

import { ab2base64 } from "@/utils"
import type { Api } from "@/utils/frontend/api"
import {
	exportKey,
	encryptUserEncryptionKey,
	generateRandomKeyPair,
} from "@/utils/frontend/e2e"
import { toPasskey } from "@/utils/frontend/e2e/auth"
import { generateDeterministicSymmetricKey } from "@/utils/frontend/e2e/kdf"


export interface UseSignUpOptions {
	api: Api,
	throwOnError?: boolean | ((error: Error) => boolean)
	onSuccess?: () => void
	onError?: (error: Error) => void
}

export enum SignUpErrorType {
	UsernameTaken = 'USERNAME_TAKEN',
	UnexpectedError = 'UNEXPECTED_ERROR',
}

export class SignUpError extends Error {
	constructor(public type: SignUpErrorType) {
		super(type)
		this.name = 'SignUpError'
	}
}

export const useSignUp = ({
	api,
	throwOnError = false,
	onSuccess,
	onError,
}: UseSignUpOptions) => {
	const mutation = useMutation({
		mutationFn: async (
			data: { username: string; password: string, licenseKey: string },
		) => {
			const uek = await generateRandomKeyPair()
			const jwk = await exportKey(uek.publicKey)
			const uekEncryptionKey = await generateDeterministicSymmetricKey(
				`${data.username}:${data.password}`,
				process.env.NEXT_PUBLIC_UEK_DERIVATION_SALT ?? data.username,
				['encrypt'],
			)
			const encryptedUek = await encryptUserEncryptionKey(
				uek.privateKey,
				uekEncryptionKey,
			)

			const payload = {
				username: data.username,
				passkey: await toPasskey(data.username, data.password),
				publicKey: jwk,
				encryptedUserEncryptionKey: ab2base64(encryptedUek),
				licenseKey: data.licenseKey,
			}

			const response = await api.fetch('/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (response.status === 409) {
				// 409 Conflict
				throw new SignUpError(SignUpErrorType.UsernameTaken)
			}

			if (!response.ok) {
				throw new SignUpError(SignUpErrorType.UnexpectedError)
			}

			const body = await response.json()

			api.setUser({
				id: body.id,
				username: data.username,
			})
			api.setUek(uek)
			api.setTokenExpiresAt(new Date(body.expiresAt))
		},
		throwOnError,
		onSuccess,
		onError,
	})

	return {
		signUp: mutation.mutateAsync,
		isLoading: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error,
	}
}