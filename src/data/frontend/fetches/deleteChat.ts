import type { Api } from "@/hooks/useApi"

export async function deleteChat(
	api: Api,
	chatId: string,
): Promise<boolean> {
	const response = await api.fetch(`/chats/${chatId}`, { method: 'DELETE' })
	if (!response.ok) {
		console.error('Failed to delete chat')
		throw new Error(`Failed to delete chat ${chatId} ${response.statusText}`)
	}

	const body = await response.json()
	return body.success
}