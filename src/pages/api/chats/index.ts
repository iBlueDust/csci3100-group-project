// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'

import dbConnect from '@/data/db/mongo'
import { PaginatedResult, Error } from '@/data/types/common'
import { ChatWithPopulatedFields, getRecentChats } from '@/data/db/mongo/queries/chats/getRecentChats'
import { sessionStore } from '@/data/session'
import { AuthData, protectedRoute } from '@/utils/api/auth'

type Data = PaginatedResult<ChatWithPopulatedFields>

async function GET(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>,
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
