import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

import dbConnect from '@/data/db/mongo'
import type { Error as ApiError, PaginatedResult } from '@/data/types/common'
import Chat from '@/data/db/mongo/models/chat'
import ChatMessage from '@/data/db/mongo/models/chat-message'
import { sessionStore } from '@/data/session'
import { ChatMessageType, ClientChatMessage } from '@/data/types/chats'
import minioClient from '@/data/db/minio'
import env from '@/env'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import { parseFormDataBody, toObjectId } from '@/utils/api'
import { makeChatMessageClientFriendly } from '@/data/db/mongo/queries/chats'

type GetData = PaginatedResult<ClientChatMessage>
type PostData = { id: string }

async function GET(
	req: NextApiRequest,
	res: NextApiResponse<GetData | ApiError>,
	auth: AuthData,
) {
	const schema = Joi.object({
		id: Joi.string().required(),
		skip: Joi.number().min(0).default(0),
		limit: Joi.number().min(1).max(100).default(10),
	})

	const { value: options, error } = schema.validate(req.query)

	if (error) {
		res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
		return
	}

	let chatId: mongoose.Types.ObjectId
	try {
		chatId = new mongoose.Types.ObjectId(options.id as string)
	} catch {
		return res
			.status(400)
			.json({ code: 'INVALID_REQUEST', message: 'Invalid chat ID' })
	}

	await dbConnect()
	const isAuthorized = await Chat.exists({
		_id: chatId,
		participants: auth.data.userId,
	})
	if (!isAuthorized) {
		return res.status(403).json({ code: 'FORBIDDEN', message: 'You are not authorized to view this chat' })
	}

	const results = await ChatMessage.aggregate([
		{ $match: { chatId } },
		{ $project: { chatId: 0, __v: 0 } },
		{
			$facet: {
				meta: [{ $count: 'total' }],
				data: [
					{ $sort: { sentAt: -1 } },
					{ $skip: options.skip },
					{ $limit: options.limit }
				]
			},
		},
	]).exec()

	const result = results[0] ?? { meta: [{ total: 0 }], data: [] }
	result.meta = result.meta[0] ?? { total: 0 }

	result.data = result.data.map(makeChatMessageClientFriendly)

	for (const message of result.data) {
		if (message.type === ChatMessageType.Attachment) {
			message.content =
				`${env.MINIO_PUBLIC_ENDPOINT}/`
				+ `${env.MINIO_BUCKET_CHAT_ATTACHMENTS}/`
				+ `${message.content}`
		}
	}

	res.status(200).json(result as PaginatedResult<ClientChatMessage>)
}

async function POST(
	req: NextApiRequest,
	res: NextApiResponse<PostData | ApiError>,
	auth: AuthData,
) {

	// Validate message content
	const { fields, files, error } = await parseFormDataBody(
		req,
		{
			maxFileSize: Math.max(
				env.CHAT_TEXT_MESSAGE_MAX_SIZE,
				env.CHAT_ATTACHMENT_MAX_SIZE,
			)
		}
	)

	if (error) {
		console.warn('Error parsing form data', error)
		return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Invalid form data' })
	}

	const unvalidatedBody = {
		content: fields?.content?.[0] ?? files?.content?.[0],
		contentFilename: files?.contentFilename?.[0],
		type: fields?.type?.[0],
		e2e: fields?.e2e?.[0] ? JSON.parse(fields?.e2e?.[0]) : null,
	}

	const schema = Joi.object({
		content: Joi.when('type', {
			is: ChatMessageType.Text,
			then: Joi.alternatives().try(
				Joi.string().max(env.CHAT_TEXT_MESSAGE_MAX_SIZE).required(),
				Joi.object({
					data: Joi.binary().max(env.CHAT_TEXT_MESSAGE_MAX_SIZE).required(),
					info: Joi
						.custom((value, helper) => {
							if (typeof value.toJSON !== 'function')
								throw new Error('Invalid file metadata')
							if (value.toJSON().size > env.CHAT_TEXT_MESSAGE_MAX_SIZE)
								return helper.error('any.max')

							return value
						})
						.required(),
				})
			),
			otherwise: Joi.object({
				data: Joi.binary().max(env.CHAT_ATTACHMENT_MAX_SIZE).required(),
				info: Joi
					.custom((value, helper) => {
						if (typeof value.toJSON !== 'function')
							throw new Error('Invalid file metadata')
						if (value.toJSON().size > env.CHAT_ATTACHMENT_MAX_SIZE)
							return helper.error('any.max')

						return value
					})
					.required(),
			})
		}),

		contentFilename: Joi.when('type', {
			is: ChatMessageType.Attachment,
			then: Joi.object({
				data: Joi
					.binary()
					.max(env.CHAT_ATTACHMENT_FILENAME_MAX_SIZE)
					.required(),
				info: Joi
					.custom((value, helpers) => {
						if (typeof value !== 'object') {
							return helpers.error('any.invalid')
						}
						if (value.size > env.CHAT_ATTACHMENT_FILENAME_MAX_SIZE) {
							const sizeInKib = env.CHAT_ATTACHMENT_FILENAME_MAX_SIZE / 1024
							throw new Error(`Content filename exceeds ${sizeInKib} KiB`)
						}

						return value
					})
					.required(),
			}),
			otherwise: Joi.forbidden(),
		}),

		type: Joi.string().valid(
			ChatMessageType.Text,
			ChatMessageType.Attachment
		).required(),

		e2e: Joi.alternatives().try(Joi.object(), Joi.allow(null)).optional()
	})

	const { value: body, error: validationError } = schema.validate(unvalidatedBody)
	if (validationError) {
		return res.status(400).json({
			code: 'INVALID_REQUEST',
			message: validationError.message
		})
	}

	// Validate chat ID
	if (typeof req.query.id !== 'string') {
		return res.status(400).json({
			code: 'INVALID_REQUEST',
			message: 'Invalid chat ID'
		})
	}
	const [chatId, parseError] = toObjectId(req.query.id)
	if (parseError) {
		return res.status(400).json({
			code: 'INVALID_REQUEST',
			message: 'Invalid chat ID'
		})
	}

	// Upload to databases
	await dbConnect()

	if (body.type === ChatMessageType.Text) {
		const doc = await ChatMessage.create({
			chatId,
			sender: auth.data.userId,
			content: body.content,
			type: body.type,
			e2e: body.e2e,
		})

		return res.status(200).send({ id: doc.id })
	} else if (body.type === ChatMessageType.Attachment) {
		const attachment = files?.content?.[0]
		if (!attachment) {
			return res.status(400).json({
				code: 'INVALID_REQUEST',
				message: 'Attachment is required'
			})
		}

		const objectName = uuid()
		await minioClient.putObject(
			env.MINIO_BUCKET_CHAT_ATTACHMENTS,
			objectName,
			attachment.data,
			Math.min(attachment.data.length, env.CHAT_ATTACHMENT_MAX_SIZE),
			{ 'Content-Type': 'application/octet-stream' } // binary
		)

		const doc = await ChatMessage.create({
			chatId,
			sender: auth.data.userId,
			content: objectName,
			contentFilename: body.contentFilename.data,
			type: body.type,
			e2e: body.e2e,
		})

		return res.status(200).send({ id: doc.id })
	} else {
		return res.status(400).json({
			code: 'INVALID_REQUEST',
			message: 'Invalid message type'
		})
	}
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<GetData | PostData | ApiError>,
) {
	switch (req.method) {
		case 'GET':
			return await protectedRoute(GET, sessionStore)(req, res)
		case 'POST':
			return await protectedRoute(POST, sessionStore)(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}

export const config = {
	api: {
		bodyParser: false, // for Formidable
	}
}