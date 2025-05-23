import { ChatMessageType, ChatWithPopulatedFields } from '@/types/chats'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeChatClientFriendly = (chat: any): ChatWithPopulatedFields => {
	return {
		id: chat._id ?? chat.id,
		wasRequestedToDelete: chat.wasRequestedToDelete ?? false,
		participants: chat.participants,
		// 	participants: chat.participants.map((participant: mongoose.Types.ObjectId) => {
		// 		const participantDoc = chat.participantLookups.find(
		// 			(p: { _id: mongoose.Types.ObjectId }) => p._id.equals(participant)
		// 		)
		// 		return {
		// 			id: participant,
		// 			username: participantDoc?.username,
		// 			publicKey: participantDoc?.publicKey,
		// 		}
		// 	}),
		lastMessage: chat.lastMessage
			? makeChatMessageClientFriendly(chat.lastMessage)
			: undefined,
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeChatMessageClientFriendly = (message: any) => {
	return {
		id: message._id.toString() ?? message.id,
		// chatId: message.chatId, // client already knows
		sender: message.sender.toString(),
		type: message.type,
		content: message.type === ChatMessageType.Text
			&& Buffer.isBuffer(message.content)
			? message.content.toString('base64')
			: message.content,
		contentFilename: message.contentFilename?.toString('base64'),
		e2e: message.e2e ? {
			...message.e2e,
			iv: message.e2e.iv?.toString('base64'),
		} : undefined,
		sentAt: message.sentAt.toISOString(),
	}
}