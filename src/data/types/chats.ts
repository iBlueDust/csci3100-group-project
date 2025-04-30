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
		publicKey: JsonWebKey
	}[]
	lastMessage?: ClientChatMessage
	wasRequestedToDelete: boolean
}

export interface ClientChat {
	id: string
	participants: {
		id: string
		username: string
		publicKey: JsonWebKey
	}[]
	lastMessage?: ClientChatMessage
	wasRequestedToDelete: boolean
}

export interface EncryptedClientChat {
	id: string
	participants: {
		id: string
		username: string
		publicKey: JsonWebKey
	}[]
	lastMessage?: EncryptedClientChatMessage
	wasRequestedToDelete: boolean
}

export interface BaseClientChatMessage {
	id: string
	sender: string
	e2e?: {
		iv: string
	}
	sentAt: string
}

export interface ClientTextChatMessage extends BaseClientChatMessage {
	type: ChatMessageType.Text
	content: string
	contentFilename?: never
}

export interface ClientAttachmentChatMessage extends BaseClientChatMessage {
	type: ChatMessageType.Attachment
	content: string
	contentFilename?: string
}

export interface ClientMarketListingChatMessage extends BaseClientChatMessage {
	type: ChatMessageType.Text
	content: string
	contentFilename?: never
	listingId: string
}

export type ClientChatMessage = ClientTextChatMessage | ClientAttachmentChatMessage


export type EncryptedClientChatMessage = {
	id: string
	content: string
	sender: string
	e2e?: {
		iv: string
	}
	sentAt: string
} & (
		{
			type: ChatMessageType.Text
		} | {
			type: ChatMessageType.Attachment
			contentFilename?: string
		}
	)