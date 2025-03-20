import * as Minio from 'minio'

const minioClient = new Minio.Client({
	endPoint: process.env.MINIO_HOST ?? 'localhost',
	port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000,
	useSSL: process.env.NODE_ENV === 'production',
	accessKey: process.env.MINIO_ACCESS_KEY,
	secretKey: process.env.MINIO_SECRET_KEY,
})

export default minioClient
