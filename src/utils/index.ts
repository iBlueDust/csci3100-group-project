export async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export function mergeObjects<T extends (object | false | null | undefined)[]>
	(...objects: T) {
	return Object.assign({}, ...objects?.filter(o => !!o) ?? [])
}