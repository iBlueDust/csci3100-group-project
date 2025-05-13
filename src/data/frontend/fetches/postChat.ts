import type { Api } from "@/hooks/useApi"

type PostChatPayload =
	{ recipient: string, recipientUsername?: never }
	| { recipient?: never, recipientUsername: string }


export type PostChatResponse = { id: string, alreadyExists?: boolean }

export async function postChat(
	api: Api,
	payload: PostChatPayload,
): Promise<PostChatResponse> {
	const response = await api.fetch('/chats', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})

	if (!response.ok && response.status !== 409) {
		console.error('Failed to create chat')
		throw new Error(`Failed to create chat ${api.user?.username}:${payload.recipient ?? payload.recipientUsername} ${response.statusText}`)
	}

	const body = await response.json()

	if (response.status === 409 && body.code === 'CHAT_ALREADY_EXISTS') {
		return { alreadyExists: true, id: body.extraInfo.id }
	}

	return body as { id: string }
}