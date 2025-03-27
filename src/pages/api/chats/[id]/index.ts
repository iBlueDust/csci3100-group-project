import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import mongoose from 'mongoose'

import dbConnect from '@/data/db/mongo'
import Chat from '@/data/db/mongo/models/chat'
import { Error } from '@/data/types/common'
import { sessionStore } from '@/data/session'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import { getChatById } from '@/data/db/mongo/queries/chats/getChatById'

type GetData = { id: string }
type DeleteData = { success: boolean }

async function GET(
	req: NextApiRequest,
	res: NextApiResponse<GetData | Error>,
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
	res: NextApiResponse<DeleteData | Error>,
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


	const chat = await Chat.findOne({
		_id: chatId,
		participants: auth.data.userId,
		deleteRequesters: { $nin: [auth.data.userId] }
	})

	if (!chat) {
		return res
			.status(404)
			.json({ code: 'NOT_FOUND', message: 'Chat not found' })
	}

	if (chat.deleteRequesters.length >= chat.participants.length - 1) {
		await chat.deleteOne()
		console.log(`Deleted chat ${chatId}`)

		// In case this chat was deleted by the other party between the time we checked
		// and now (race condition), let's clean up all chats that should be deleted
		// delete all chats where deleteRequesters.length >= participants.length - 1
		const results = await Chat.deleteMany({
			$expr: {
				$gte: [
					{ $size: "$deleteRequesters" },
					{ $subtract: [{ $size: "$participants" }, 1] }
				]
			}
		}).catch(() => null)

		if (results) {
			console.log(`Deleted ${results.deletedCount ?? 0} empty chats`)
		} else {
			console.error('Failed to delete empty chats')
		}

		return res.status(200).json({ success: true })
	}

	chat.deleteRequesters.push(auth.data.userId)
	await chat.save()

	return res.status(200).json({ success: true })
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<GetData | Error>,
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