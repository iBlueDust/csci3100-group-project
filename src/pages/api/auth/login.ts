// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import Joi from 'joi'

import dbConnect from "@/data/api/mongo"
import User, { UserPublicKeyJWK } from "@/data/api/mongo/models/user"
import { sessionStore, sessionToCookie } from "@/data/api/session"
import { UserRole } from "@/types/auth"
import { sleep } from "@/utils"

type Data = {
	id: string
	expiresAt: string
	publicKey: UserPublicKeyJWK
	encryptedUserEncryptionKey?: string
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
	if (!user) {
		await sleep(Math.random() * 2000)
		res.status(404).json({ code: 'USER_NOT_FOUND' })
		return
	}
	if (!user.verifyPasskey(Buffer.from(body.passkey, 'base64'))) {
		// delay response to prevent timing attacks
		await sleep(Math.random() * 2000)
		res.status(401).json({ code: 'INVALID_CREDENTIALS' })
		return
	}

	const session = await sessionStore.createSession(user.id, [UserRole.USER])

	// httpOnly cookies
	res.setHeader('Set-Cookie', sessionToCookie(session))
	res
		.status(200)
		.send({
			id: user.id,
			expiresAt: session.expiresAt.toISOString(),
			publicKey: user.publicKey,
			encryptedUserEncryptionKey:
				user.encryptedUserEncryptionKey?.toString('base64'),
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