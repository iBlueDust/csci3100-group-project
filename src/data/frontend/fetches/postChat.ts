import type { Api } from "@/utils/frontend/api"

type PostChatPayload =
	{ recipient: string, recipientUsername?: never }
	| { recipient?: never, recipientUsername: string }

export async function postChat(
	api: Api,
	payload: PostChatPayload,
): Promise<{ id: string }> {
	const response = await api.fetch('/chats', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})
	if (!response.ok) {
		console.error('Failed to create chat')
		throw new Error(`Failed to create chat ${api.user?.username}:${payload.recipient ?? payload.recipientUsername} ${response.statusText}`)
	}

	const body = await response.json()
	return body as { id: string }
}