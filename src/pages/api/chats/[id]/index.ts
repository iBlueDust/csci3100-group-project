import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'

import dbConnect from '@/data/db/mongo'
import { Error } from '@/data/types/common'
import { sessionStore } from '@/data/session'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import mongoose from 'mongoose'
import { getChatById } from '@/data/db/mongo/queries/chats/getChatById'

type Data = {
	id: string
}

async function GET(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
	auth: AuthData,
) {
	const { value: id, error } = Joi.string().required().validate(req.query.id)

	if (error) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
		return
	}

	let chatId: mongoose.Types.ObjectId
	try {
		chatId = new mongoose.Types.ObjectId(id)
	} catch {
		return res
			.status(400)
			.json({ code: 'INVALID_REQUEST', message: 'Invalid chat ID' })
	}

	await dbConnect()
	const chat = await getChatById(chatId, auth.data.userId)
	if (!chat) {
		return res
			.status(404)
			.json({ code: 'NOT_FOUND', message: 'Chat not found' })
	}

	res.status(200).json(chat)
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data | Error>,
) {
	switch (req.method) {
		case 'GET':
			return await protectedRoute(GET, sessionStore)(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}