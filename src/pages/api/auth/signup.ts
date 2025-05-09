// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import Joi from 'joi'
import { MongoServerError } from "mongodb"

import dbConnect from "@/data/db/mongo"
import User, { UserPublicKeyJWK } from "@/data/db/mongo/models/user"
import { sessionStore, sessionToCookie } from "@/data/session"
import { UserRole } from "@/data/types/auth"
import { isLicenseKey, isValidLicenseKey } from "@/data/licenses"
import { sleep } from "@/utils"

type Data = {
	id: string
	expiresAt: string
}

type Error = {
	code: string,
	message?: string
}

const jwkSchema = Joi.object({
	kty: Joi.string().valid('EC').required(),
	crv: Joi.string().valid('P-521').required(),
	x: Joi.string().base64({ urlSafe: true, paddingRequired: false }).required(),
	y: Joi.string().base64({ urlSafe: true, paddingRequired: false }).required(),
	ext: Joi.boolean().valid(true).required(),
	key_ops: Joi.array().items(Joi.string().valid('deriveKey', 'deriveBits')).optional(),
	d: Joi.forbidden(), // private key not allowed in this context
})

async function POST(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
) {
	const schema = Joi.object({
		username: Joi.string().pattern(/^[a-zA-Z0-9.-]{1,64}$/).required(),
		passkey: Joi.string().base64().required(),
		licenseKey: Joi.string()
			.custom(key => {
				if (!isLicenseKey(key)) {
					throw new Error('Invalid license key format')
				}
				return key
			})
			.required(),
		publicKey: jwkSchema.required(),
		encryptedUserEncryptionKey: Joi.string().base64().optional(),
	})

	const validation = schema.validate(req.body)

	if (validation.error) {
		res.status(400)
			.json({ code: 'INVALID_REQUEST', message: validation.error.message })
		return
	}

	const body = validation.value as {
		username: string,
		passkey: string,
		licenseKey: string,
		publicKey: UserPublicKeyJWK,
		encryptedUserEncryptionKey?: string,
	}

	if (!isValidLicenseKey(body.licenseKey)) {
		await sleep(Math.random() * 2000) // delay response to prevent timing attacks
		res.status(403).json({
			code: 'INVALID_LICENSE_KEY',
			message: 'Invalid license key'
		})
		return
	}

	await dbConnect()

	let user: Awaited<ReturnType<typeof User.createWithPasskey>>
	try {
		user = await User.createWithPasskey({
			username: body.username,
			passkey: Buffer.from(body.passkey, 'base64'),
			roles: [UserRole.USER],
			publicKey: body.publicKey,
			encryptedUserEncryptionKey:
				body.encryptedUserEncryptionKey
					? Buffer.from(body.encryptedUserEncryptionKey, 'base64')
					: undefined,
		})
	} catch (error) {
		if (
			error instanceof MongoServerError
			&& (error as MongoServerError).code === 11000 // Duplicate key error code
		) {
			return res
				.status(409)
				.json({ code: 'USERNAME_TAKEN', message: 'Username is already taken' })
		}


		return res
			.status(500)
			.json({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'An unexpected error occurred'
			})
	}

	const session = await sessionStore.createSession(user.id, user.roles)

	res.setHeader('Set-Cookie', sessionToCookie(session))
	res
		.status(200)
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