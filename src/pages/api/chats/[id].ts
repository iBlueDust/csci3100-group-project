import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'

import dbConnect from '@/data/db/mongo'
import { Error } from '@/data/types/common'
import Chat from '@/data/db/mongo/models/chat'
import { sessionStore } from '@/data/session'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import mongoose from 'mongoose'

type Data = {
	id: string
}

async function POST(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
	auth: AuthData,
) {
	const { value: recipientId, error } = Joi.string().required().validate(req.query.id)

	if (error) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
		return
	}

	let recipient: mongoose.Types.ObjectId
	try {
		recipient = new mongoose.Types.ObjectId(recipientId)
	} catch {
		return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Invalid recipient ID' })
	}

	await dbConnect()
	const chat = await Chat.create({ participants: [auth.data.userId, recipient] })

	res.status(200).json({ id: chat.id })
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
) {
	switch (req.method) {
		case 'POST':
			return await protectedRoute(POST, sessionStore)(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}