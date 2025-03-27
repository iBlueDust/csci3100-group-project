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

type GetData = PaginatedResult<ChatWithPopulatedFields>
type PostData = { id: string }

async function GET(
  req: NextApiRequest,
  res: NextApiResponse<GetData | Error>,
  auth: AuthData,
) {
  const schema = Joi.object({
    query: Joi.string().optional(),
    skip: Joi.number().min(0).default(0),
    limit: Joi.number().min(1).max(100).default(10),
  })

  const { value: options, error } = schema.validate(req.query)

  if (error) {
    res.status(400).json({ code: 'INVALID_REQUEST', message: error.message })
    return
  }

  await dbConnect()
  const payload = await getRecentChats(auth.data.userId, options)

  res.status(200).json(payload)
}

async function POST(
  req: NextApiRequest,
  res: NextApiResponse<PostData | Error>,
  auth: AuthData,
) {
  const schema = Joi.object({
    recipient: Joi.string().required()
  })
  const { value: body, error } = schema.validate(req.body)
  const recipientId = body.recipient

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

  if (recipient.equals(auth.data.userId)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Cannot create chat with self' })
  }

  await dbConnect()

  const chatExists = await Chat.exists({
    participants: { $all: [auth.data.userId, recipient], $size: 2 }
  })
  if (chatExists) {
    return res.status(400).json({ code: 'CHAT_ALREADY_EXISTS', message: 'Chat already exists' })
  }

  const recipientExists = await User.exists({ _id: recipient })
  if (!recipientExists) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Recipient not found' })
  }

  const chat = await Chat.create({ participants: [auth.data.userId, recipient] })

  res.status(200).json({ id: chat.id })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetData | PostData | Error>,
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
