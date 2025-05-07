// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import mongoose from 'mongoose'

import dbConnect from '@/data/db/mongo'
import Chat from '@/data/db/mongo/models/chat'
import User from '@/data/db/mongo/models/user'
import { PaginatedResult, Error } from '@/data/types/common'
import { getRecentChats } from '@/data/db/mongo/queries/chats/getRecentChats'
import { sessionStore } from '@/data/session'
import { ChatWithPopulatedFields } from '@/data/types/chats'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import { assertIsObjectId } from '@/utils/api'
import { getChatByRecipient } from '@/data/db/mongo/queries/chats/getChatByRecipient'

type GetData = PaginatedResult<ChatWithPopulatedFields> | ChatWithPopulatedFields
type PostData = { id: string }

async function GET(
  req: NextApiRequest,
  res: NextApiResponse<GetData | Error>,
  auth: AuthData,
) {
  const schema = Joi.object({
    query: Joi.string().optional(),
    skip: Joi.number().min(0).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    recipient: Joi.custom(assertIsObjectId).optional(),
  })
    .nand('query', 'recipient')
    .nand('skip', 'recipient')
    .nand('limit', 'recipient')

  const { value: options, error } = schema.validate(req.query)

  if (error) {
    res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
    return
  }

  if (options.recipient) {
    const recipientId = options.recipient as mongoose.Types.ObjectId
    if (recipientId.equals(auth.data.userId)) {
      return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Cannot get chat with self' })
    }

    const payload = await getChatByRecipient(auth.data.userId, recipientId)
    if (!payload) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Chat not found' })
    }

    return res.status(200).json(payload)
  }

  options.skip = options.skip || 0
  options.limit = options.limit || 10
  const payload = await getRecentChats(auth.data.userId, options)

  res.status(200).json(payload)
}

async function POST(
  req: NextApiRequest,
  res: NextApiResponse<PostData | Error<{ id: string }>>,
  auth: AuthData,
) {
  const schema = Joi.object({
    recipient: Joi.string().custom(assertIsObjectId).optional(),
    recipientUsername: Joi.string().optional(),
  }).xor('recipient', 'recipientUsername')

  const { value: body, error } = schema.validate(req.body)

  if (error) {
    res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
    return
  }

  if (body.recipient && body.recipient.equals(auth.data.userId)) {
    return res.status(400)
      .json({ code: 'INVALID_REQUEST', message: 'Cannot create chat with self' })
  }

  let recipientId: mongoose.Types.ObjectId
  if (body.recipientUsername) {
    const userDoc = await User.findOne({ username: body.recipientUsername })
    if (!userDoc) {
      return res.status(404)
        .json({ code: 'NOT_FOUND', message: 'Recipient not found' })
    }

    if (userDoc._id.equals(auth.data.userId)) {
      return res.status(400)
        .json({
          code: 'INVALID_REQUEST',
          message: 'Cannot create chat with self',
        })
    }

    recipientId = userDoc._id
  } else {
    recipientId = body.recipient as mongoose.Types.ObjectId
  }

  await dbConnect()

  const chatExists = await Chat.exists({
    participants: { $all: [auth.data.userId, recipientId], $size: 2 }
  })
  if (chatExists) {
    return res.status(409).json({
      code: 'CHAT_ALREADY_EXISTS',
      message: 'Chat already exists',
      extraInfo: {
        id: chatExists._id.toString(),
      },
    } as Error<{ id: string }>)
  }

  const recipientExists = await User.exists({ _id: recipientId })
  if (!recipientExists) {
    return res.status(404)
      .json({ code: 'NOT_FOUND', message: 'Recipient not found' })
  }

  const chat = await Chat.create({
    participants: [auth.data.userId, recipientId]
  })

  res.status(200).json({ id: chat.id })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetData | PostData | Error<{ id: string }>>,
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
