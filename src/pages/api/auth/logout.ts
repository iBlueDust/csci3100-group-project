// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import { sessionStore } from "@/data/session"
import { validateSession } from "@/utils/api/auth"

type Data = undefined

type Error = {
	code: string,
	message?: string
}

async function DELETE(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
) {
	const token = req.cookies['token']
	const refreshToken = req.cookies['refreshToken']
	const data = await validateSession(sessionStore, token, refreshToken)

	if (data) {
		// delete `token` and `refreshToken` from the session store and client cookies
		await sessionStore.revokeUserSessions(data.userId.toString())
	}

	// remove httpOnly cookies
	res.setHeader('Set-Cookie', [
		`token=; Path=/; HttpOnly; SameSite=Strict; Expires=${new Date(0).toUTCString()}`,
		`refreshToken=; Path=/; HttpOnly; SameSite=Strict; Expires=${new Date(0).toUTCString()}`,
	])
	res.status(200).end()
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
) {
	switch (req.method) {
		case "DELETE":
			return await DELETE(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}