// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import Joi from 'joi'
import { sessionStore } from "@/data/session"
import { UserRole } from "@/data/types/auth"

type Data = {
	token: string
	refreshToken: string
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
		password: Joi.string().pattern(/^[ -~]{8,128}$/).required(), // all ascii printables
	})

	const { value: body, error } = schema.validate(req.body)

	if (error) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
	}

	const session = await sessionStore.createSession(body.username, [UserRole.USER])

	res.status(200).json({
		token: session.token,
		refreshToken: session.refreshToken,
	})
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