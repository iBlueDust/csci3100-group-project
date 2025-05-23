import mongoose from "mongoose"

import { isDev } from "@/utils/api/env"


const ChatSchema = new mongoose.Schema({
	participants: [{
		id: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		username: {
			type: String,
			index: true,
		},
		publicKey: { // JSON Web Key (JWK) format
			type: Object,
			required: true,
		}
	}],

	// If one party deletes the chat, the chat will still be available until
	// the other party deletes it as well
	deleteRequesters: [{
		type: mongoose.Types.ObjectId,
		ref: 'User',
		index: true,
	}],
})

function generateModel() {
	const Chat = mongoose.model('Chat', ChatSchema)

	if (isDev) {
		Chat.on('index', (err) => {
			if (err) {
				console.error('[DB] Chat index error: %s', err)
			} else {
				console.info('[DB] Chat indexing complete')
			}
		})
	}

	return Chat
}

const existingModel = mongoose.models.Chat as ReturnType<typeof generateModel>

export default existingModel ?? generateModel()