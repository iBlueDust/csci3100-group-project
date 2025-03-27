import crypto from 'crypto'
import mongoose from 'mongoose'
import type { NextApiRequest, NextApiResponse } from "next"

import type { SessionStore, TokenData } from '@/data/session'

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

export type AuthData = {
	token: string,
	refreshToken: string,
	data: TokenData<mongoose.Types.ObjectId>
}

export const validateSession = async (
	sessionStore: SessionStore,
	token: string | undefined,
	refreshToken: string | undefined,
): Promise<TokenData<mongoose.Types.ObjectId> | false> => {
	if (!token || !refreshToken)
		return false

	const tokenData = await sessionStore.checkToken(token)
	if (!tokenData)
		return false

	let userId: mongoose.Types.ObjectId
	try {
		userId = new mongoose.Types.ObjectId(tokenData.userId)
	} catch {
		return false
	}

	return { ...tokenData, userId }
}

export const protectedRoute = <T>(
	handler: (req: NextApiRequest, res: NextApiResponse, auth: AuthData) => T,
	sessionStore: SessionStore,
) => {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		const token = req.cookies['token']
		const refreshToken = req.cookies['refreshToken']
		const data = await validateSession(sessionStore, token, refreshToken)
		if (!data) {
			return res.status(401).json({ code: 'UNAUTHORIZED' })
		}

		return await handler(
			req,
			res,
			{ token: token!, refreshToken: refreshToken!, data }
		)
	}
}