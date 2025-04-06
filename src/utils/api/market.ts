import Joi from "joi"
import { v4 as uuid } from "uuid"
import type formidable from "formidable"

import env from "@/env"

export const mimeTypeToExtension = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/gif': 'gif',
	'image/webp': 'webp',
} as Record<string, string>

export const isSupportedMimeType = (mimeType: string) =>
	!!mimeTypeToExtension[mimeType]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const joiValidateFileInfo = (value: any, helpers: Joi.CustomHelpers) => {
	if (typeof value !== 'object' || !isSupportedMimeType(value.mimetype)) {
		return helpers.error('any.invalid')
	}
	if (value.size > env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT) {
		const limitInKib = env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT / 1024
		throw new Error(`File size exceeds ${limitInKib} KiB`)
	}

	return value
}

export const joiFileSchema = Joi.object({
	data: Joi.binary()
		.max(env.MARKET_LISTING_ATTACHMENT_SIZE_LIMIT)
		.required(),
	info: Joi
		.custom(joiValidateFileInfo)
		.required(),
})

export const patchPictureArrayUsesAllNewPictures = (
	pictures: number[],
	numNewPictures: number = 0,
) => {
	const newPicturesUsedVector = new Array(numNewPictures).fill(false)

	for (const index of pictures) {
		if (index >= 0) continue // refers to an existing picture

		const newIndex = -index - 1
		if (newIndex < numNewPictures) {
			newPicturesUsedVector[newIndex] = true
		}
	}

	return newPicturesUsedVector.every((used) => used)
}

export const patchPictureArrayWithinBounds = (
	pictures: number[],
	numExistingPictures: number,
	numNewPictures: number = 0,
) => {
	return pictures.every((index) =>
		-numNewPictures <= index && index < numExistingPictures
	)
}

export const patchPictureArrayAllUnique = (
	pictures: number[],
	numExistingPictures: number,
	numNewPictures: number = 0,
) => {
	const usedVector = new Array(numExistingPictures + numNewPictures).fill(false)
	for (const picture of pictures) {
		const index = picture + numNewPictures
		if (usedVector[index]) {
			return false
		}
		usedVector[index] = true
	}
	return true
}

export const patchPictureArrayUnusedPictures = (
	pictures: number[],
	numExistingPictures: number,
	numNewPictures: number = 0,
) => {
	console.log({ pictures, numExistingPictures, numNewPictures })
	const usedVector = new Array(numExistingPictures + numNewPictures).fill(false)
	for (const picture of pictures) {
		const index = picture + numNewPictures
		usedVector[index] = true
	}

	return usedVector.map((used, index) => [used, index])
		.filter(([used]) => !used)
		.map(([, index]) => index - numNewPictures)
}

export const generatePictureObjectName = (picture: { info: formidable.File }) => {
	const extension = mimeTypeToExtension[picture.info.mimetype!]
	const objectName = `${uuid()}.${extension}`
	return objectName
}