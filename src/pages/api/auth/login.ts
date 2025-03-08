// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import Joi from 'joi'

import dbConnect from "@/data/db/mongo"
import User from "@/data/db/mongo/models/user"
import { sessionStore, sessionToCookie } from "@/data/session"
import { UserRole } from "@/data/types/auth"
import { sleep } from "@/utils"

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
) {
	const schema = Joi.object({
		username: Joi.string().pattern(/^[a-zA-Z0-9.-]{1,64}$/).required(),
		passkey: Joi.string().base64().required(), // hash of the user password
	})

	const { value: body, error } = schema.validate(req.body)

	if (error) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
	}

	await dbConnect()
	const user = await User.findOne({ username: body.username })
	if (!user || !user.verifyPasskey(body.passkey)) {
		// delay response to prevent timing attacks
		await sleep(Math.random() * 2000)
		res.status(401).json({ code: 'INVALID_CREDENTIALS' })
		return
	}

	const session = await sessionStore.createSession(user.id, [UserRole.USER])

	// httpOnly cookies
	res.setHeader('Set-Cookie', sessionToCookie(session))
	res.status(200).send({ id: user.id })
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