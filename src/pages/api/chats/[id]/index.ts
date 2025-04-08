import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import mongoose from 'mongoose'

import dbConnect from '@/data/db/mongo'
import type { Error as ApiError } from '@/data/types/common'
import { sessionStore } from '@/data/session'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import { getChatById } from '@/data/db/mongo/queries/chats/getChatById'
import { deleteChat } from '@/data/db/mongo/queries/chats/deleteChat'
import type { ChatWithPopulatedFields } from '@/data/types/chats'

type GetData = ChatWithPopulatedFields
type DeleteData = { success: boolean }

async function GET(
	req: NextApiRequest,
	res: NextApiResponse<GetData | ApiError>,
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

async function DELETE(
	req: NextApiRequest,
	res: NextApiResponse<DeleteData | ApiError>,
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

	const foundAndDeleted = await deleteChat(chatId, auth.data.userId)

	if (!foundAndDeleted) {
		res
			.status(404)
			.json({ code: 'NOT_FOUND', message: 'Chat not found' })
		return
	}

	res.status(200).json({ success: true })
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<GetData | ApiError>,
) {
	switch (req.method) {
		case 'GET':
			return await protectedRoute(GET, sessionStore)(req, res)
		case 'DELETE':
			return await protectedRoute(DELETE, sessionStore)(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}