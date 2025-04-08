import { zip } from '@/utils'
import * as Minio from 'minio'

const minioClient = new Minio.Client({
	endPoint: process.env.MINIO_HOST ?? 'localhost',
	port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000,
	useSSL: process.env.NODE_ENV === 'production',
	accessKey: process.env.MINIO_ACCESS_KEY,
	secretKey: process.env.MINIO_SECRET_KEY,
})

export default minioClient


/**
 * Uploads multiple objects to a MinIO bucket concurrently.
 * 
 * If any of the uploads fail, the function will try to delete all objects that
 * were successfully uploaded in the background to try to be atomic. There
 * is no guarantee that all objects will be deleted.
 * @returns `{ success: true }` if all objects were uploaded successfully,
 * or `{ success: false, objectsToCleanup: string[], 
 * onCleanupFail: Promise<string[]> }` if any upload failed, where
 * `objectsToCleanup` is a list of object names that were successfully uploaded
 * and `onCleanupFail` is a promise that resolves to a list of object names
 * that failed to be deleted.
 */
export const putManyObjects = async (
	minioClient: Minio.Client,
	bucketName: string,
	objects: {
		name: string,
		data: Buffer,
		maxSize?: number,
		metadata?: Minio.ItemBucketMetadata
	}[],
): Promise<
	{ success: true }
	| {
		success: false,
		objectsToCleanup: string[],
		failedObjects: string[],
		onCleanupFail: Promise<string[]>
	}
> => {
	const results = await Promise.allSettled(
		objects.map(({ name, data, maxSize, metadata }) => {
			return minioClient.putObject(
				bucketName,
				name,
				data,
				maxSize,
				metadata,
			)
		})
	)

	if (results.some(result => result.status === 'rejected')) {
		// `objectsToCleanup` are the objects that were successfully uploaded
		const objectsToCleanup = zip(results, objects)
			.filter(([result]) => result.status === 'fulfilled')
			.map(([, object]) => object.name)
		// `failedObjects` are the objects that failed to upload
		// and are `objectsToCleanup`'s complement
		const failedObjects = zip(results, objects)
			.filter(([result]) => result.status === 'rejected')
			.map(([, object]) => object.name)

		// Delete all successfully uploaded objects in **background**
		const cleanupPromise = objectsToCleanup.map((objectName) =>
			minioClient.removeObject(bucketName, objectName)
		)

		return {
			success: false,
			failedObjects: failedObjects,
			objectsToCleanup: objectsToCleanup,
			onCleanupFail: Promise.allSettled(cleanupPromise).then((results) =>
				zip(results, objectsToCleanup)
					.filter(([result]) => result.status === 'rejected')
					.map(([, objectName]) => objectName)
			),
		}
	}

	return { success: true }
}