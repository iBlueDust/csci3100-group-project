import mongoose from "mongoose"

const ChatSchema = new mongoose.Schema({
	participants: [{
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true
	}],

	// If one party deletes the chat, the chat will still be available until
	// the other party deletes it as well
	deleteRequesters: [{
		type: mongoose.Types.ObjectId,
		ref: 'User',
	}],
})

function generateModel() {
	return mongoose.model('Chat', ChatSchema)
}

const existingModel = mongoose.models.Chat as ReturnType<typeof generateModel>

export default existingModel ?? generateModel()