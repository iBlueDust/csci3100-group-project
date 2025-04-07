export enum ChatMessageType {
	Text = 'text',
	Attachment = 'attachment',
}

export interface ChatWithPopulatedFields {
	id: string
	participants: {
		id: string
		username: string
	}[]
	lastMessage: {
		id: string
		sender: string
		type: ChatMessageType
		content: string
	}
	wasRequestedToDelete: boolean
}