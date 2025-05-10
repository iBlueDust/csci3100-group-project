import mongoose from "mongoose"

import { ChatMessageType } from "@/data/types/chats"
import { isDev } from "@/env"

const ChatMessageSchema = new mongoose.Schema({
	chatId: {
		type: mongoose.Types.ObjectId,
		ref: 'Chat',
		required: true,
		index: true,
	},

	sender: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true,
	},

	sentAt: {
		type: Date,
		default: Date.now,
		index: true,
	},

	content: {
		// string or buffer
		type: mongoose.Schema.Types.Mixed,
		required: true
	},

	// for attachments, so that `content` can be a URL and ChatMessage can still
	// hold the file name for display purposes
	contentFilename: {
		// string or buffer
		type: mongoose.Schema.Types.Mixed,
	},

	e2e: { type: Object },

	type: {
		type: String,
		enum: [ChatMessageType.Text, ChatMessageType.Attachment],
		default: ChatMessageType.Text
	}
})

ChatMessageSchema.index({ chatId: 1, sender: 1, sentAt: 1 })

function generateModel() {
	const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema)

	if (isDev) {
		ChatMessage.on('index', (err) => {
			if (err) {
				console.error('[DB] ChatMessage index error: %s', err)
			} else {
				console.info('[DB] ChatMessage indexing complete')
			}
		})
	}

	return ChatMessage
}

const existingModel = mongoose.models.ChatMessage as ReturnType<typeof generateModel>

export default existingModel ?? generateModel()