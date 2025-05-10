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
export const deleteAllChatsByUserId = async (
	userId: mongoose.Types.ObjectId,
): Promise<void> => {
	await dbConnect()
	const chats = await Chat.find({
		participants: userId,
		deleteRequesters: { $nin: [userId] }
	})

	// If user is last one in chat, delete the chat from the database
	const chatsToSave = []
	const chatsToDelete = []
	for (const chat of chats) {
		if (chat.deleteRequesters.length >= chat.participants.length - 1) {
			chatsToDelete.push(chat)
		} else {
			// If user is not last one in chat, mark the chat for deletion but
			// let the other party still read the messages
			chat.deleteRequesters.push(userId)
			chatsToSave.push(chat)
		}
	}

	if (chatsToDelete.length > 0) {
		const chatDeleteResult = await Chat.deleteMany({
			_id: { $in: chatsToDelete.map(chat => chat._id) }
		})

		if (chatDeleteResult.deletedCount === chatsToDelete.length) {
			console.log(`Deleted ${chatDeleteResult.deletedCount} chats belonging to user ${userId}`)
		} else {
			console.warn(`Deleted ${chatDeleteResult.deletedCount} chats, but expected to delete ${chatsToDelete.length} belonging to user ${userId}`)
		}

		// In case this chat was deleted by the other party between the time we checked
		// and now (race condition), let's clean up all chats that should be deleted
		// delete all chats where deleteRequesters.length >= participants.length - 1
		const results = await Chat.deleteMany({
			$expr: {
				$gte: [
					{ $size: "$deleteRequesters" },
					{ $subtract: [{ $size: "$participants" }, 1] }
				]
			}
		}).catch(() => null)

		if (results) {
			console.log(`Deleted ${results.deletedCount ?? 0} empty chats`)
		} else {
			console.error('Failed to delete empty chats')
		}
	}

	await deleteOrphanedChatMessages()

	if (chatsToSave.length > 0) {
		await Chat.updateMany(
			{ _id: { $in: chatsToSave.map(chat => chat._id) } },
			{ $addToSet: { deleteRequesters: userId } }
		)
	}
}