import mongoose from "mongoose"

const ChatMessageSchema = new mongoose.Schema({
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
		type: Buffer,
		required: true
	},
})

function generateModel() {
	return mongoose.model('ChatMessage', ChatMessageSchema)
}

const existingModel = mongoose.models.ChatMessage as ReturnType<typeof generateModel>

export default existingModel ?? generateModel()