import type { Api } from "@/hooks/useApi"

export async function deleteMyAccount(
	api: Api,
): Promise<boolean> {
	const response = await api.fetch('/users/me', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
	})
	if (!response.ok) {
		console.error('Failed to delete account')
		throw new Error(`Failed to delete account ${response.statusText}`)
	}

	const body = await response.json()
	return !!body.success
}