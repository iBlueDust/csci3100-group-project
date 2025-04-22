export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'

const env = {
	NEXT_PUBLIC_UEK_DERIVATION_SALT: process.env.NEXT_PUBLIC_UEK_DERIVATION_SALT as string,
}

export default env