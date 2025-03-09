export interface ChatWithPopulatedFields {
	id: string
	participants: {
		id: string
		username: string
	}[]
	lastMessage: {
		id: string
		sender: {
			id: string
			username: string
		}
		type: 'text' | 'image'
		content: string
	}
	wasRequestedToDelete: boolean
}