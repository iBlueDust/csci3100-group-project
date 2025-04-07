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
		lastMessage: chat.lastMessage ? {
			id: chat.lastMessage._id ?? chat.lastMessage.id,
			sender: chat.lastMessage.sender,
			type: chat.lastMessage.type,
			content: chat.lastMessage.type === ChatMessageType.Text
				&& Buffer.isBuffer(chat.lastMessage.content)
				? chat.lastMessage.content.toString('base64')
				: chat.lastMessage.content,
			contentFilename: chat.lastMessage.contentFilename,
			e2e: chat.lastMessage.e2e,
			sentAt: chat.lastMessage.sentAt.toISOString(),
		} : undefined,
	}
}