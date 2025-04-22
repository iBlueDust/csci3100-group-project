// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import dbConnect from "@/data/db/mongo"
import User from "@/data/db/mongo/models/user"
import { sessionStore, sessionToCookie } from "@/data/session"
import { UserRole } from "@/data/types/auth"
import env from "@/env"

type Data = {
	id: string
	expiresAt: string
}

type Error = {
	code: string,
	message?: string
}

async function POST(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
) {
	const refreshToken = req.cookies['refreshToken']
	if (!refreshToken) {
		return res.status(401).json({ code: 'INVALID_CREDENTIALS' })
	}

	const refreshTokenData = await sessionStore.checkRefreshToken(refreshToken)
	if (!refreshTokenData) {
		return res.status(401).json({ code: 'INVALID_CREDENTIALS' })
	}

	const issuedAt = new Date()
	const userId = refreshTokenData.userId

	await dbConnect()
	const user = await User.findOne({ _id: userId }).select('roles')
	if (!user) {
		return res.status(401).json({ code: 'INVALID_CREDENTIALS' })
	}

	// If refresh token is not halfway through its expiration time, only reissue token
	const halfExpiration = (1000 * env.AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS / 2)
	if (Date.now() - refreshTokenData.issuedAt.getTime() < halfExpiration) {
		const newToken = await sessionStore
			.reissueToken(user.id, user.roles as UserRole[])
		const session = {
			token: newToken.token,
			refreshToken,
			issuedAt: issuedAt,
			expiresAt: newToken.expiresAt,
		}

		res.setHeader('Set-Cookie', sessionToCookie(session))
		res.status(200)
			.send({ id: user.id, expiresAt: session.expiresAt.toISOString() })
		return
	}

	// Also invalidates old tokens
	const session = await sessionStore.createSession(user.id, user.roles as UserRole[])

	// httpOnly cookies
	res.setHeader('Set-Cookie', sessionToCookie(session))
	res.status(200)
		.send({ id: user.id, expiresAt: session.expiresAt.toISOString() })
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
) {
	switch (req.method) {
		case "POST":
			return await POST(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}