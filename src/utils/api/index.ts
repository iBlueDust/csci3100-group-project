import formidable from "formidable"
import mongoose from "mongoose"
import type { NextApiRequest } from "next"
import { Writable } from "stream"

export async function parseJsonBody<T>(
	req: NextApiRequest
): Promise<{ body: T } | { error: unknown }> {
	const buffer = req.read()
	if (!buffer) {
		return { error: new Error('Empty request body') }
	}
	const bodyStr = buffer.toString('utf-8')

	try {
		return { body: JSON.parse(bodyStr) }
	} catch (error) {
		return { error }
	}
}

export interface File {
	info: formidable.File
	data: Buffer
}

export async function parseFormDataBody(
	req: NextApiRequest,
	options: {
		maxFileSize?: number,
		filter?: (part: formidable.Part) => boolean,
	},
): Promise<
	{
		fields: formidable.Fields,
		files: Record<string, File[]>,
		error?: never,
	}
	| { error: unknown, fields?: never, files?: never }
> {

	const fileContents = new Map<string, Buffer[]>()

	const formidableOptions: formidable.Options = {
		maxFileSize: options.maxFileSize,
		keepExtensions: true,
		fileWriteStreamHandler: (file) => {
			if (!file) return new Writable()

			const filepath = file.toJSON().originalFilename!

			if (!fileContents.has(filepath)) {
				fileContents.set(filepath, [])
			}
			const buffers = fileContents.get(filepath)!

			const stream = new Writable({
				write(chunk: Buffer, _, callback) {
					buffers.push(chunk)
					callback()
				}
			})

			return stream
		}
	}
	if (options.filter) {
		formidableOptions.filter = options.filter
	}

	const form = formidable(formidableOptions)

	let fields: formidable.Fields
	let files: formidable.Files
	try {
		[fields, files] = await form.parse(req)
	} catch (error) {
		return { error }
	}

	return {
		fields,
		files: Object.fromEntries(
			Object.entries(files).map(([field, files]) => [
				field,
				files?.map(file => ({
					info: file,
					data: Buffer.concat(
						fileContents.get(file.toJSON().originalFilename!) ?? []
					)
				})) ?? []
			] as const)
		)
	}
}

export function assertIsObjectId(
	id: unknown
): mongoose.Types.ObjectId {
	if (typeof id !== 'string') {
		throw new Error('Invalid ObjectId')
	}

	const objectId = new mongoose.Types.ObjectId(id)
	return objectId
}

export function toObjectId(
	id: string
): [mongoose.Types.ObjectId, null] | [null, unknown] {
	try {
		return [new mongoose.Types.ObjectId(id), null] as const
	} catch (error) {
		return [null, error] as const
	}
}