import Chat from '@/data/api/mongo/models/chat'
import ChatMessage from '@/data/api/mongo/models/chat-message'
import { ChatMessageType } from "@/types/chats"
import env from "@/utils/api/env"
import minioClient from "@/data/api/minio"

export const deleteOrphanedChatMessages = async () => {
	const messages = await ChatMessage.aggregate([
		{
			$lookup: {
				from: Chat.collection.name,
				localField: 'chatId',
				foreignField: '_id',
				as: 'chat',
			},
		},
		{
			$match: {
				chat: { $eq: [] },
			},
		},
		{ $project: { _id: 1, content: 1, type: 1 } }
	])

	if (messages.length <= 0) {
		return
	}

	const results = await ChatMessage.deleteMany({
		_id: { $in: messages.map(m => m._id) }
	})
	if (results.deletedCount < messages.length) {
		console.warn(`Deleted ${results.deletedCount} messages not in any chat, but ${messages.length - results.deletedCount} messages were not deleted`)
	} else {
		console.log(`Deleted ${results.deletedCount} messages not in any chat`)
	}

	const allAttachments = messages
		.filter(m => m.type === ChatMessageType.Attachment)
		.map(m => m.content)

	const attachmentDeleteResults = await Promise.allSettled(
		allAttachments.map(async (objectName) =>
			await minioClient.removeObject(
				env.MINIO_BUCKET_CHAT_ATTACHMENTS,
				objectName,
			)
		)
	)
	if (attachmentDeleteResults.some(result => result.status === 'rejected')) {
		const failedAttachments = attachmentDeleteResults
			.filter(result => result.status === 'rejected')
			.map(result => result.reason)
		console.error('Failed to delete some attachments:', failedAttachments)
	}
}

