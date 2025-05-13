import type mongoose from "mongoose"

import dbConnect from '@/data/db/mongo'
import Chat from '@/data/db/mongo/models/chat'
import { deleteOrphanedChatMessages } from "./deleteOrphanedChatMessages"


/**
 * Deletes a chat from a user's chat list. 
 * 
 * If all parties request to delete the chat, it will be deleted from the 
 * database. If only one party requests to delete the chat, it will be marked 
 * for deletion and information will be sent to the other party.
 * @returns `true` if the chat was successfully deleted. `false` if the chat was not found or the user is not a participant of the chat. 
 */
export const deleteChat = async (
	chatId: mongoose.Types.ObjectId,
	userId: mongoose.Types.ObjectId,
): Promise<boolean> => {
	await dbConnect()
	const chat = await Chat.findOne({
		_id: chatId,
		'participants.id': userId,
		deleteRequesters: { $nin: [userId] }
	})

	if (!chat) {
		return false
	}

	const userIsLastInChat = chat.deleteRequesters.length >= chat.participants.length - 1
	if (userIsLastInChat) {
		// Delete the chat, orphan the messages (will be deleted later)
		await chat.deleteOne()
		console.log(`Deleted chat ${chatId}`)

		// In case this chat was deleted by the other party between the time we checked
		// and now (race condition), let's clean up all chats that should be deleted
		// delete all chats where deleteRequesters.length >= participants.length - 1
		const results = await Chat.deleteMany({
			$expr: {
				$gte: [
					{ $size: "$deleteRequesters" },
					{ $size: "$participants" },
				]
			}
		}).catch(() => null)

		if (results) {
			console.log(`Deleted ${results.deletedCount ?? 0} empty chats`)
		} else {
			console.error('Failed to delete empty chats')
		}
	} else {
		chat.deleteRequesters.push(userId)
		await chat.save()
	}

	// Now, we finally delete the chat messages, and all other orphaned messages
	await deleteOrphanedChatMessages()

	return true
}