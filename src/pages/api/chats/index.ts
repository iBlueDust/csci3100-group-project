// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import mongoose from 'mongoose'

import dbConnect from '@/data/api/mongo'
import Chat from '@/data/api/mongo/models/chat'
import User from '@/data/api/mongo/models/user'
import { getRecentChats } from '@/data/api/mongo/queries/chats/getRecentChats'
import { getChatByRecipient } from '@/data/api/mongo/queries/chats/getChatByRecipient'
import { sessionStore } from '@/data/api/session'
import { PaginatedResult, Error } from '@/types/common'
import { ChatWithPopulatedFields } from '@/types/chats'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import { assertIsObjectId } from '@/utils/api'

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

  // FIXME: Type this properly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let users: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recipient: any
  if (body.recipientUsername) {
    users = await User.find({
      $or: [
        { username: body.recipientUsername },
        { _id: auth.data.userId }
      ]
    })
    recipient = users.find((user) => user.username === body.recipientUsername)
  } else {
    users = await User.find({
      _id: { $in: [auth.data.userId, body.recipient] }
    })
    recipient = users.find((user) => user._id.equals(body.recipient))
  }

  const me = users.find((user) => user._id.equals(auth.data.userId))

  if (!me || !recipient) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Users not found' })
  }

  await dbConnect()
  const chatExists = await Chat.exists({
    'participants.id': { $all: [auth.data.userId, recipient._id] },
    $expr: { $eq: [{ $size: "$participants" }, 2] }
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
  const chat = await Chat.create({
    participants: users.map((user) => ({
      id: user._id,
      username: user.username,
      publicKey: user.publicKey,
    })),
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
