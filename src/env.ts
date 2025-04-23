import Joi from 'joi'

const schema = Joi.object({
	NEXT_PUBLIC_API_ENDPOINT: Joi.string().min(1).required(),
	NEXT_PUBLIC_UEK_DERIVATION_SALT: Joi.string().min(1).required(),

	AUTH_TOKEN_SECRET: Joi.string().required(),
	AUTH_TOKEN_EXPIRATION_SECONDS: Joi.number().min(1).default(300),
	AUTH_REFRESH_TOKEN_SECRET: Joi.string().required(),
	AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS: Joi.number().min(1).default(12 * 3600),

	MONGO_HOST: Joi.string().min(1).default('localhost'),
	MONGO_PORT: Joi.number().default(27017),
	MONGO_DB: Joi.string().min(1).default('jadetrail'),
	MONGO_USERNAME: Joi.string().min(1).default('app'),
	MONGO_PASSWORD: Joi.string().min(1).required(),

	MINIO_HOST: Joi.string().min(1).default('localhost'),
	MINIO_PORT: Joi.number().default(9000),
	MINIO_PUBLIC_ENDPOINT: Joi.string().uri().required(), // accessible by client
	MINIO_BACKEND_USER: Joi.string().min(1).required(),
	MINIO_BACKEND_PASSWORD: Joi.string().min(1).required(),
	MINIO_ACCESS_KEY: Joi.string().min(1).required(),
	MINIO_SECRET_KEY: Joi.string().min(1).required(),
	MINIO_BUCKET_CHAT_ATTACHMENTS: Joi.string().min(1).default('chat-attachments'),
	MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS: Joi.string().min(1).default('market-listing-attachments'),

	REDIS_PASSWORD: Joi.string().min(1).required(),

	CHAT_TEXT_MESSAGE_MAX_SIZE: Joi.number().default(1024 * 1024),
	CHAT_ATTACHMENT_MAX_SIZE: Joi.number().default(25 * 1024 * 1024),
	CHAT_ATTACHMENT_FILENAME_MAX_SIZE: Joi.number().default(10 * 1024),
	MARKET_LISTING_ATTACHMENT_LIMIT: Joi.number().default(10),
	MARKET_LISTING_ATTACHMENT_SIZE_LIMIT: Joi.number().default(5 * 1024 * 1024), // 5 MiB
	MARKET_LISTING_TITLE_MAX_LENGTH: Joi.number().default(200),
	MARKET_LISTING_DESCRIPTION_MAX_LENGTH: Joi.number().default(1200),
})

const { error, value: env } = schema.validate(process.env, {
	allowUnknown: true,
	abortEarly: false,
})
if (error) {
	throw new Error(`Environment variable validation error: ${error.message}`)
}

export default env

export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'
