export async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export function mergeObjects<T extends (object | false | null | undefined)[]>
	(...objects: T) {
	return Object.assign({}, ...objects?.filter(o => !!o) ?? [])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zip<T extends any[][]>(...arrays: T): { [K in keyof T]: T[K] extends (infer U)[] ? U : never }[] {
	if (arrays.length === 0) return []

	const minLength = Math.min(...arrays.map(arr => arr.length))
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const result: any[] = []

	for (let i = 0; i < minLength; i++) {
		result.push(arrays.map(arr => arr[i]))
	}

	return result as { [K in keyof T]: T[K] extends (infer U)[] ? U : never }[]
}

/*
Convert a string into an ArrayBuffer (browser-friendly)
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
export function str2ab(str: string) {
	const buf = new ArrayBuffer(str.length)
	const bufView = new Uint8Array(buf)
	for (let i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i)
	}
	return buf
}

export function ab2str(buf: ArrayBuffer) {
	return String.fromCharCode(...new Uint8Array(buf))
}

export function ab2base64(bytes: ArrayBuffer): string {
	const binary = String.fromCharCode(...new Uint8Array(bytes))
	const base64 = btoa(binary)
	return base64
}

export function base642ab(base64: string): ArrayBuffer {
	return str2ab(atob(base64))
}


export function ab2hex(buffer: ArrayBuffer) {
	return [...new Uint8Array(buffer)]
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
}

export function hex2ab(hex: string): ArrayBuffer {
	const hexPairs = hex.match(/[\da-f]{2}/gi)
	if (!hexPairs) throw new Error('Invalid hex string')
	const bytes = new Uint8Array(hexPairs.map(h => parseInt(h, 16)))
	return bytes.buffer
}

export function hex2base64url(hex: string) {
	const binary = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16))
	if (!binary) return ''
	// convert to base64
	const b64 = btoa(String.fromCharCode(...(binary as number[])))
	// convert to base64url
	return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function toBinaryBlob(...parts: BlobPart[]) {
	return new Blob(parts, { type: 'application/octet-stream' })
}


export const mimeTypeToExtension = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/gif': 'gif',
	'image/webp': 'webp',
} as Record<string, string>
export const extensionToMimeType = Object.fromEntries(
	Object.entries(mimeTypeToExtension).map(([key, value]) => [value, key])
)

export const isSupportedImageMimeType = (mimeType: string) =>
	!!mimeTypeToExtension[mimeType]

export const isSupportedImageExtension = (mimeType: string) =>
	!!extensionToMimeType[mimeType]

export const isSupportedImage = (filename: string) => {
	return /\.(jpe?g|png|gif|webp)$/i.test(filename)
}

export const getExtension = (filename: string) => {
	const match = filename.match(/\.([a-zA-Z0-9]+)$/)
	if (!match) {
		return null
	}
	return match[1].toLowerCase()
}
