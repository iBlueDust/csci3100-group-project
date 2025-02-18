import crypto from 'crypto'

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET ?? crypto.randomBytes(32)
const REFRESH_TOKEN_SECRET = process.env.AUTH_REFRESH_TOKEN_SECRET ?? crypto.randomBytes(32)

const hash = (value: string | Buffer, secret: string | Buffer) => {
	return crypto.createHmac('sha256', secret).update(value).digest('base64')
}

export const generateToken = () => {
	const payload = crypto.randomBytes(32) // 256 bits
	const signature = hash(payload, TOKEN_SECRET)
	return `${payload.toString('base64')}.${signature}`
}

export const generateRefreshToken = () => {
	const payload = crypto.randomBytes(32) // 256 bits
	const signature = crypto.createHmac('sha256', REFRESH_TOKEN_SECRET).update(payload).digest('base64')
	return `${payload.toString('base64')}.${signature}`
}

export const verifyToken = (token: string) => {
	const [encodedPayload, signature] = token.split('.')
	const payload = Buffer.from(encodedPayload, 'base64')
	const expectedSignature = hash(payload, TOKEN_SECRET)
	return signature === expectedSignature
}

export const verifyRefreshToken = (token: string) => {
	const [encodedPayload, signature] = token.split('.')
	const payload = Buffer.from(encodedPayload, 'base64')
	const expectedSignature = hash(payload, REFRESH_TOKEN_SECRET)
	return signature === expectedSignature
}