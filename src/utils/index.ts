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
