import mongoose from "mongoose"
import type { NextApiRequest } from "next"
import Busboy from "@fastify/busboy"

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

export interface FileInfo {
	filename: string
	encoding: string
	mimetype: string
}

export interface File extends FileInfo {
	size: number
	data: Buffer
}

export async function parseFormDataBody(
	req: NextApiRequest,
	options: {
		maxFileSize?: number,
		filter?: (info: FileInfo) => boolean,
	},
): Promise<
	{
		fields: Record<string, (string | File)[]>,
		error?: never,
	}
	| { error: unknown, fields?: never }
> {
	return new Promise((resolve) => {
		const busboy = new Busboy({
			headers: {
				...req.headers,
				'content-type': req.headers['content-type'] ?? '',
			},
		})

		const fields: Record<string, (string | File)[]> = {}

		busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
			const info: FileInfo = { filename, encoding, mimetype }
			const buffers: Buffer[] = []
			let size = 0

			if (options.filter && !options.filter(info)) {
				file.destroy()
				resolve({ error: new Error('File did not pass filter') })
				return
			}

			if (!fields[fieldname]) {
				fields[fieldname] = []
			}
			fields[fieldname].push(info as File)

			file.on('data', (data: Buffer) => {
				size += data.length

				if (options.maxFileSize && size > options.maxFileSize) {
					file.destroy()
					resolve({ error: new Error('File size exceeds limit') })
					return
				}

				buffers.push(data)
			})

			file.on('end', () => {
				if (options.maxFileSize && size > options.maxFileSize) {
					resolve({ error: new Error('File size exceeds limit') })
					return
				}

				(info as File).data = Buffer.concat(buffers);
				(info as File).size = size
			})
		})

		busboy.on('field', (fieldname, value) => {
			if (!fields[fieldname]) {
				fields[fieldname] = []
			}
			fields[fieldname].push(value)
		})

		busboy.on('finish', () => {
			resolve({ fields })
		})

		busboy.on('error', error => resolve({ error }))

		req.pipe(busboy)
	})
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

export const generateMinioObjectName = (info: FileInfo) => {
	const extension = getExtension(info.filename)
	console.log({ info, extension })
	if (!extension) {
		return uuid()
	}

	return `${uuid()}.${extension}`
}
