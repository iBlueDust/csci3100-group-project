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

export async function parseFormDataBody(
	req: NextApiRequest,
	options: { maxFileSize?: number },
): Promise<
	{
		fields: formidable.Fields,
		files: Record<string, { info: formidable.File, data: Buffer }[]>,
		error?: never,
	}
	| { error: unknown, fields?: never, files?: never }
> {


	const fileContents = new Map<string, Buffer[]>()

	const form = formidable({
		maxFileSize: options.maxFileSize,
		keepExtensions: true,
		fileWriteStreamHandler: (file) => {
			if (!file) return new Writable()

			const filepath = file.toJSON().filepath

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

			if (file) {
				stream.write(file.toString())
			}
			return stream
		}
	})

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
					data: Buffer.concat(fileContents.get(file.toJSON().filepath)?.slice(1) ?? [])
				})) ?? []
			] as const)
		)
	}
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