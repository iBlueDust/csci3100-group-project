import type { EncryptedClientChat } from "@/types/chats"
import type { Api } from "@/hooks/useApi"

export async function getChatByRecipient(
	api: Api,
	recipientId: string,
): Promise<EncryptedClientChat> {
	const params = new URLSearchParams({ recipient: recipientId })
	const response = await api.fetch(`/chats?${params}`, {
		headers: { 'Content-Type': 'application/json' },
	})
	if (!response.ok) {
		console.error('Failed to fetch chats')
		throw new Error(`Failed to fetch chats ${response.statusText}`)
	}

	const body = await response.json()
	return body
}