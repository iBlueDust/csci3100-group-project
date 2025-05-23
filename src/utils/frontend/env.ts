// Do not import Joi in frontend code
export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'

const env = {
	NEXT_PUBLIC_UEK_DERIVATION_SALT: process.env.NEXT_PUBLIC_UEK_DERIVATION_SALT as string,
	NEXT_PUBLIC_CHAT_TEXT_MESSAGE_MAX_SIZE: parseInt(process.env.NEXT_PUBLIC_CHAT_TEXT_MESSAGE_MAX_SIZE as string),
	NEXT_PUBLIC_CHAT_ATTACHMENT_MAX_SIZE: parseInt(process.env.NEXT_PUBLIC_CHAT_ATTACHMENT_MAX_SIZE as string),
	NEXT_PUBLIC_CHAT_ATTACHMENT_FILENAME_MAX_SIZE: parseInt(process.env.NEXT_PUBLIC_CHAT_ATTACHMENT_FILENAME_MAX_SIZE as string),
	NEXT_PUBLIC_MARKET_LISTING_ATTACHMENT_LIMIT: parseInt(process.env.NEXT_PUBLIC_MARKET_LISTING_ATTACHMENT_LIMIT as string),
	NEXT_PUBLIC_MARKET_LISTING_ATTACHMENT_SIZE_LIMIT: parseInt(process.env.NEXT_PUBLIC_MARKET_LISTING_ATTACHMENT_SIZE_LIMIT as string),
	NEXT_PUBLIC_MARKET_LISTING_TITLE_MAX_LENGTH: parseInt(process.env.NEXT_PUBLIC_MARKET_LISTING_TITLE_MAX_LENGTH as string),
	NEXT_PUBLIC_MARKET_LISTING_DESCRIPTION_MAX_LENGTH: parseInt(process.env.NEXT_PUBLIC_MARKET_LISTING_DESCRIPTION_MAX_LENGTH as string),
}

export default env