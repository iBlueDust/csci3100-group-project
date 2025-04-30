import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { ClientAttachmentChatMessage } from "@/data/types/chats"
import { str2ab, getExtension, extensionToMimeType } from '@/utils'
import { decryptMessage } from '@/utils/frontend/e2e'


export function useAttachment(
	message: ClientAttachmentChatMessage,
	sharedKey: CryptoKey,
) {
	const [url, setUrl] = useState<string | null>(null)
	const [isDownloading, setIsDownloading] = useState(false)

	const _isDownloading = useRef(false)
	const download = useCallback(async () => {
		if (!message.content || !message.e2e || isDownloading) return

		setIsDownloading(true)
		_isDownloading.current = true

		const response = await fetch(message.content)
		if (!response.ok) {
			throw new Error('Failed to fetch attachment')
		}
		const blob = await response.blob()
		const buffer = await blob.arrayBuffer()
		const iv = new Uint8Array(str2ab(atob(message.e2e!.iv)))
		const decryptedFile = await decryptMessage(buffer, iv, sharedKey)

		// If the component is unmounted, don't set the URL
		if (!_isDownloading.current) return
		_isDownloading.current = false

		const extension = message.contentFilename
			? getExtension(message.contentFilename)
			: null
		const mimeType = extension ? extensionToMimeType[extension] : null
		const url = URL.createObjectURL(
			new Blob([decryptedFile], { type: mimeType ?? '' }),
		)
		console.log({ url })
		setUrl(url)
		setIsDownloading(false)
	}, [message, sharedKey, isDownloading])

	useEffect(() => {
		return () => {
			_isDownloading.current = false
			setIsDownloading(false)
			if (url) {
				URL.revokeObjectURL(url)
				setUrl(null)
			}
		}
	}, [url])

	return useMemo(() => ({
		url,
		isDownloading,
		download,
	}), [url, isDownloading, download])
}