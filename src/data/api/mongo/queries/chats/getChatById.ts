import mongoose from 'mongoose'

import Chat from '@/data/api/mongo/models/chat'
import ChatMessage from '@/data/api/mongo/models/chat-message'
import { ChatWithPopulatedFields } from '@/types/chats'
import { makeChatClientFriendly } from '.'


export const getChatById = async (
	chatId: mongoose.Types.ObjectId,
	userId: mongoose.Types.ObjectId,
): Promise<ChatWithPopulatedFields | null> => {
	const results = await Chat.aggregate([
		{
			$match: {
				_id: chatId,
				'participants.id': userId,
				deleteRequesters: { $ne: userId },
			}
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
		// {
		// 	$lookup: {
		// 		from: User.collection.name,
		// 		localField: 'participants',
		// 		foreignField: '_id',
		// 		as: 'participantLookups',
		// 		pipeline: [{ $project: { _id: 1, username: 1, publicKey: 1 } }],
		// 	},
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
		{ $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },
		{ $limit: 1 },
	]).exec()

	if (results.length === 0) {
		return null
	}

	const result = results[0]

	return makeChatClientFriendly(result)
}