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

export interface ClientChat {
	id: string
	participants: {
		id: string
		username: string
		publicKey: JsonWebKey
	}[]
	lastMessage?: {
		id: string
		sender: string
		content: string
		sentAt: string
		e2e: unknown
	} & (
		| {
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

export interface ClientChatMessage {
	id: string
	// chatId: string // client already knows
	sender: string
	type: ChatMessageType
	content: string | Buffer
	contentFilename?: string
	e2e?: {
		iv: string
	}
	sentAt: string
}