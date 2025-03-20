import mongoose from "mongoose"

import { ChatMessageType } from "@/data/types/chats"

const ChatMessageSchema = new mongoose.Schema({
	chatId: {
		type: mongoose.Types.ObjectId,
		ref: 'Chat',
		required: true,
	},

	sender: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true
	},

	sentAt: {
		type: Date,
		default: Date.now,
	},

	content: {
		// string or buffer
		type: mongoose.Schema.Types.Mixed,
		required: true
	},

	e2e: { type: Object },

	type: {
		type: String,
		enum: [ChatMessageType.Text, ChatMessageType.Attachment],
		default: ChatMessageType.Text
	}
})

function generateModel() {
	return mongoose.model('ChatMessage', ChatMessageSchema)
}

const existingModel = mongoose.models.ChatMessage as ReturnType<typeof generateModel>

export default existingModel ?? generateModel()