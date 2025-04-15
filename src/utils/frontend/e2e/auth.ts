import { ab2base64 } from '@/utils'
import { hash } from '.'

export type Passkey = string

export async function toPasskey(
	username: string,
	password: string,
): Promise<Passkey> {
	const passkeyMaterial = `${username}:${password}`
	const passkey = await hash(passkeyMaterial)
	return ab2base64(passkey)
}