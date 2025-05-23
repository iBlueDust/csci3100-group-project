import mongoose from 'mongoose'

import type { PaginatedResult, PaginationOptions } from '@/types/common'
import dbConnect from '@/data/api/mongo'
import Chat from '@/data/api/mongo/models/chat'
import ChatMessage from '@/data/api/mongo/models/chat-message'
import { ChatWithPopulatedFields } from '@/types/chats'
import { mergeObjects } from '@/utils'
import { makeChatClientFriendly } from '.'


export const getRecentChats = async (
  userId: mongoose.Types.ObjectId,
  options: PaginationOptions<{ query?: string, id?: mongoose.Types.ObjectId }>,
): Promise<PaginatedResult<ChatWithPopulatedFields>> => {
  await dbConnect()
  const [result] = await Chat.aggregate([
    {
      $match: mergeObjects(
        options.id && { _id: options.id },
        {
          'participants.id': userId,
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
          // {
          //   $lookup: {
          //     from: User.collection.name,
          //     localField: 'participants',
          //     foreignField: '_id',
          //     as: 'participantLookups',
          //     pipeline: [{ $project: { _id: 1, username: 1, publicKey: 1 } }],
          //   },
          // },
          {
            $lookup: {
              from: ChatMessage.collection.name,
              let: { chatId: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$chatId', '$$chatId'] } } },
                { $sort: { sentAt: -1 } },
                { $limit: 1 },
                {
                  $project: {
                    _id: 1,
                    sender: 1,
                    type: 1,
                    content: 1,
                    contentFilename: 1,
                    sentAt: 1,
                    e2e: 1,
                  },
                },
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

  // Reformat data
  if (!result) {
    return { data: [], meta: { ...options, total: 0 } }
  }
  if (!result.data) {
    result.data = []
  }

  result.data = result.data.map(makeChatClientFriendly)

  // Copy options to meta object
  result.meta = { ...options, ...result.meta[0] }

  return result as PaginatedResult<ChatWithPopulatedFields>
}
