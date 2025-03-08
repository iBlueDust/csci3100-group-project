// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import dbConnect from "@/data/db/mongo"
import User from "@/data/db/mongo/models/user"
import { sessionStore, sessionToCookie } from "@/data/session"
import { UserRole } from "@/data/types/auth"
import { AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS } from "@/data/session"
import { AuthData, protectedRoute } from "@/utils/api/auth"

type Data = {
	id: string
}

type Error = {
	code: string,
	message?: string
}

async function POST(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
	auth: AuthData,
) {
	await dbConnect()
	const user = await User.findById(auth.data.userId)
	if (!user) {
		return res.status(401).json({ code: 'INVALID_CREDENTIALS' })
	}

	const refreshTokenData = await sessionStore.checkRefreshToken(auth.refreshToken.toString())
	if (!refreshTokenData) {
		return res.status(401).json({ code: 'INVALID_CREDENTIALS' })
	}

	const refreshTokenExpiresAt = refreshTokenData.expiresAt
	const issuedAt = new Date()

	// If refresh token is not halfway through its expiration time, only reissue token
	if (refreshTokenExpiresAt.getTime() - Date.now() > (1000 * AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS / 2)) {
		const newToken = await sessionStore.reissueToken(user.username, user.roles as UserRole[])
		const session = { token: newToken, refreshToken: auth.refreshToken, issuedAt }
		return res.setHeader('Set-Cookie', sessionToCookie(session))
	}

	// Also invalidates old tokens
	const session = await sessionStore.createSession(user.username, user.roles as UserRole[])

	// httpOnly cookies
	res.setHeader('Set-Cookie', sessionToCookie(session))
	res.status(200)
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
) {
	switch (req.method) {
		case "POST":
			return await protectedRoute(POST, sessionStore)(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}