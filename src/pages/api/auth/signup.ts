// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import Joi from 'joi'
import { MongoServerError } from "mongodb"

import dbConnect from "@/data/db/mongo"
import User from "@/data/db/mongo/models/user"
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
		passkey: Joi.string().base64().required(), // all ascii printables
	})

	const { value: body, error } = schema.validate(req.body)

	if (error) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
	}

	await dbConnect()

	let user: Awaited<ReturnType<typeof User.createWithPasskey>>
	try {
		user = await User.createWithPasskey(body.username, body.passkey, [UserRole.USER])
	} catch (error) {
		if (error instanceof MongoServerError && (error as MongoServerError).code === 11000) { // Duplicate key error code
			return res.status(409).json({ code: 'USERNAME_TAKEN', message: 'Username is already taken' })
		}
		return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' })
	}

	const session = await sessionStore.createSession(body.username, user.roles)

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