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
) => {
	return pictures.every((index) =>
		0 <= index && index < numExistingPictures
	)
}

export const patchPictureArrayAllUnique = (
	pictures: number[],
	numExistingPictures: number,
) => {
	const usedVector = new Array(numExistingPictures).fill(false)
	for (const picture of pictures) {
		const index = picture
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
	const usedVector = new Array(numExistingPictures + numNewPictures).fill(false)
	for (const picture of pictures) {
		const index = picture + numNewPictures
		usedVector[index] = true
	}

	return usedVector.map((used, index) => [used, index])
		.filter(([used]) => !used)
		.map(([, index]) => index - numNewPictures)
}