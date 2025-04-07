import type mongoose from 'mongoose'

import { ChatMessageType, ChatWithPopulatedFields } from '@/data/types/chats'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeChatClientFriendly = (chat: any): ChatWithPopulatedFields => {
	chat.id = chat._id
	delete chat._id

	chat.participants = (chat.participants as mongoose.Types.ObjectId[])
		.map(participant => {
			type Participant = { _id: mongoose.Types.ObjectId, username: string }
			const participantDoc = (chat.participantLookups as Participant[])
				.find((p) => p._id.equals(participant))

			if (!participantDoc) {
				return { id: participant }
			}

			return { id: participant, username: participantDoc.username }
		})
	delete chat.participantLookups

	if (chat.lastMessage) {
		chat.lastMessage.id = chat.lastMessage._id
		delete chat.lastMessage._id

		chat.lastMessage.sender = chat.lastMessage.sender

		if (chat.lastMessage.type === ChatMessageType.Text
			&& Buffer.isBuffer(chat.lastMessage.content)) {
			chat.lastMessage.content = chat.lastMessage.content.toString('base64')
		}
	}

	return chat as ChatWithPopulatedFields
}