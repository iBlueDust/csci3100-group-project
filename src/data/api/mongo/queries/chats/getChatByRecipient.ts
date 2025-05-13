import mongoose from 'mongoose'

import dbConnect from '@/data/api/mongo'
import Chat from '@/data/api/mongo/models/chat'
import ChatMessage from '@/data/api/mongo/models/chat-message'
import { ChatWithPopulatedFields } from '@/types/chats'
import { makeChatClientFriendly } from '.'


export const getChatByRecipient = async (
  userId: mongoose.Types.ObjectId,
  recipientId: mongoose.Types.ObjectId,
): Promise<ChatWithPopulatedFields | null> => {
  await dbConnect()
  const [result] = await Chat.aggregate([
    {
      $match: {
        // both IDs must appear in the nested `participants.id` array
        'participants.id': { $all: [userId, recipientId] },
        // still exclude chats the user has requested to delete
        deleteRequesters: { $ne: userId },
      },
    },
    { $limit: 1 },
    {
      $addFields: {
        wasRequestedToDelete: {
          $gt: [{ $size: '$deleteRequesters' }, 0],
        },
      },
    },
    { $project: { _id: 1, participants: 1, wasRequestedToDelete: 1 } },
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
