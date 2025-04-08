import { hash } from '.'

export type Passkey = string

export async function toPasskey(
	username: string,
	password: string,
): Promise<Passkey> {
	const passkey = `${username}:${password}`
	return await hash(passkey)
}