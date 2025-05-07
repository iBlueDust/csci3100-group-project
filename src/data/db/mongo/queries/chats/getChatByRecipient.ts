import mongoose from 'mongoose'

import dbConnect from '@/data/db/mongo'
import Chat from '@/data/db/mongo/models/chat'
import ChatMessage from '@/data/db/mongo/models/chat-message'
import User from '@/data/db/mongo/models/user'
import { ChatWithPopulatedFields } from '@/data/types/chats'
import { makeChatClientFriendly } from '.'


export const getChatByRecipient = async (
  userId: mongoose.Types.ObjectId,
  recipientId: mongoose.Types.ObjectId,
): Promise<ChatWithPopulatedFields | null> => {
  await dbConnect()
  const [result] = await Chat.aggregate([
    {
      $match: {
        participants: {
          $all: [userId, recipientId],
        },
        deleteRequesters: { $ne: userId },
      },
    },
    { $limit: 1 },
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
      $lookup: {
        from: User.collection.name,
        localField: 'participants',
        foreignField: '_id',
        as: 'participantLookups',
        pipeline: [{ $project: { _id: 1, username: 1, publicKey: 1 } }],
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
  ]).exec()

  // Reformat data
  if (!result) {
    return null
  }

  return makeChatClientFriendly(result) as ChatWithPopulatedFields
}
