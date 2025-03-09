import mongoose, { Types } from 'mongoose'

import type { PaginatedResult, PaginationOptions } from '@/data/types/common'
import dbConnect from '@/data/db/mongo'
import Chat from '@/data/db/mongo/models/chat'
import ChatMessage from '@/data/db/mongo/models/chat-message'
import User from '@/data/db/mongo/models/user'
import { ChatWithPopulatedFields } from '@/data/types/chats'
import { mergeObjects } from '@/utils'

export const getRecentChats = async (
  userId: Types.ObjectId,
  options: PaginationOptions<{ query?: string, id?: mongoose.Types.ObjectId }>,
): Promise<PaginatedResult<ChatWithPopulatedFields>> => {
  await dbConnect()
  const [result] = await Chat.aggregate([
    {
      $match: mergeObjects(
        options.id && { _id: options.id },
        {
          participants: userId,
          deleteRequesters: { $ne: userId },
        }
      ),
    },
    {
      $addFields: {
        // Check if deleteRequesters is not empty or an empty array
        wasRequestedToDelete: {
          $gt: [{ $size: '$deleteRequesters' }, 0],
        },
      },
    },
    { $project: { _id: 1, participants: 1, wasRequestedToDelete: 1 } },
    {
      $facet: {
        data: [
          {
            $lookup: {
              from: User.collection.name,
              localField: 'participants',
              foreignField: '_id',
              as: 'participants',
              pipeline: [{ $project: { _id: 1, username: 1 } }],
            },
          },
          {
            $lookup: {
              from: ChatMessage.collection.name,
              let: { chatId: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$chatId', '$$chatId'] } } },
                { $sort: { sentAt: -1 } },
                { $limit: 1 },
                { $project: { _id: 1, sender: 1, type: 1, content: 1 } },
              ],
              as: 'lastMessage',
            },
          },
          {
            $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true },
          },
          { $sort: { 'lastMessage.sentAt': -1 } },
          { $skip: options.skip },
          { $limit: options.limit },
        ],
        meta: [{ $count: 'total' }],
      },
    },
  ]).exec()

  // Change _id to id
  for (const chat of result.data) {
    chat.id = chat._id
    delete chat._id

    for (const participant of chat.participants) {
      participant.id = participant._id
      delete participant._id
    }

    if (chat.lastMessage) {
      chat.lastMessage.id = chat.lastMessage._id
      delete chat.lastMessage._id

      chat.lastMessage.sender.id = chat.lastMessage.sender._id
      delete chat.lastMessage.sender._id
    }
  }

  // Copy options to meta object
  result.meta = { ...options, ...result.meta[0] }

  return result as PaginatedResult<ChatWithPopulatedFields>
}
