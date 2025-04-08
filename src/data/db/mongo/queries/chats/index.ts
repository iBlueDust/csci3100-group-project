import type mongoose from 'mongoose'

import { ChatMessageType, ChatWithPopulatedFields } from '@/data/types/chats'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeChatClientFriendly = (chat: any): ChatWithPopulatedFields => {
	return {
		id: chat._id ?? chat.id,
		wasRequestedToDelete: chat.wasRequestedToDelete ?? false,
		participants: chat.participants.map((participant: mongoose.Types.ObjectId) => {
			return {
				id: participant,
				username: chat.participantLookups
					.find(
						(p: { _id: mongoose.Types.ObjectId }) => p._id.equals(participant)
					).username,
			}
		}),
		lastMessage: chat.lastMessage
			? makeChatMessageClientFriendly(chat.lastMessage)
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeChatMessageClientFriendly = (message: any) => {
	return {
		id: message._id ?? message.id,
		// chatId: message.chatId, // client already knows
		sender: message.sender,
		type: message.type,
		content: message.type === ChatMessageType.Text
			&& Buffer.isBuffer(message.content)
			? message.content.toString('base64')
			: message.content,
		contentFilename: message.contentFilename,
		e2e: message.e2e,
		sentAt: message.sentAt.toISOString(),
	}
}