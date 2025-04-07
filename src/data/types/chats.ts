import type mongoose from 'mongoose'

export enum ChatMessageType {
	Text = 'text',
	Attachment = 'attachment',
}

export interface ChatWithPopulatedFields {
	id: mongoose.Types.ObjectId
	participants: {
		id: mongoose.Types.ObjectId
		username: string
	}[]
	lastMessage?: {
		id: mongoose.Types.ObjectId
		sender: string
		content: string
		sentAt: string
		e2e: unknown
	}
	& (
		{
			type: ChatMessageType.Text
			contentFilename?: never
		}
		| {
			type: ChatMessageType.Attachment
			contentFilename: string
		}
	)
	wasRequestedToDelete: boolean
}