import type mongoose from 'mongoose'

export enum ChatMessageType {
	Text = 'text',
	Attachment = 'attachment',
	MarketListing = 'market-listing',
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
	lastMessage?: EncryptedClientChatMessage<string>
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

export interface ClientMarketListingChatMessage extends BaseClientChatMessage {
	type: ChatMessageType.MarketListing
	content: string
}


export interface ClientAttachmentChatMessage extends BaseClientChatMessage {
	type: ChatMessageType.Attachment
	content: string
	contentFilename?: string
}

export type ClientChatMessage = ClientTextChatMessage
	| ClientMarketListingChatMessage
	| ClientAttachmentChatMessage


interface BaseEncryptedClientChatMessage<
	T extends ArrayBuffer | string = ArrayBuffer
> {
	id: string
	sender: string
	sentAt: string
	content: T
	e2e?: {
		iv: T
	}
}

export interface EncryptedClientTextChatMessage<
	T extends ArrayBuffer | string = ArrayBuffer
> extends BaseEncryptedClientChatMessage<T> {
	type: ChatMessageType.Text
}

export interface EncryptedClientAttachmentChatMessage<
	T extends ArrayBuffer | string = ArrayBuffer
> extends BaseEncryptedClientChatMessage<T> {
	type: ChatMessageType.Attachment
	contentFilename?: T
}

export type EncryptedClientChatMessage<
	T extends ArrayBuffer | string = ArrayBuffer
> =
	| EncryptedClientTextChatMessage<T>
	| EncryptedClientAttachmentChatMessage<T>
