import { createClient as createRedisClient } from "redis"

import { UserRole } from "./types/auth"
import { generateRefreshToken, generateToken, verifyRefreshToken, verifyToken } from "@/utils/api/auth"
import env from "@/env"

export interface TokenData<TId = string> {
	userId: TId
	roles: string[]
	token: string
	issuedAt: Date
	expiresAt: Date
}

export interface RefreshTokenData<TId = string> {
	userId: TId
	refreshToken: string
	issuedAt: Date
	expiresAt: Date
}

export interface Session {
	token: string
	refreshToken: string
	issuedAt: Date
	expiresAt: Date
}

export type Awaitable<T> = T | Promise<T>

export abstract class SessionStore {
	abstract createSession(userId: string, roles: string[]): Awaitable<Session>

	abstract getSession(userId: string): Awaitable<TokenData | null>

	abstract checkToken(token: string): Awaitable<
		TokenData | null
	>
	abstract checkToken(token: string, roles: UserRole[]): Awaitable<
		TokenData & { isAuthorized: boolean } | null
	>

	abstract checkRefreshToken(refreshToken: string): Awaitable<
		RefreshTokenData | null
	>

	abstract reissueToken(userId: string, roles: string[]): Awaitable<TokenData>

	abstract revokeUserSessions(userId: string): Awaitable<void>
}

export class InMemorySessionStore extends SessionStore {
	private tokensByUserId: Record<string, TokenData> = {}
	private tokens: Record<string, TokenData> = {}

	private refreshTokensByUserId: Record<string, RefreshTokenData> = {}
	private refreshTokens: Record<string, RefreshTokenData> = {}

	checkToken(token: string): Awaitable<
		TokenData | null
	>
	checkToken(token: string, roles: UserRole[]): Awaitable<
		TokenData & { isAuthorized: boolean } | null
	>
	checkToken(token: string, roles?: UserRole[]): Awaitable<
		TokenData & { isAuthorized?: boolean } | null
	> {
		const session = this.tokens[token]
		if (!session) {
			return null
		}

		if (!verifyToken(token)) {
			return null
		}

		const isExpired = session.expiresAt < new Date()
		if (isExpired) {
			this.revokeUserSessions(session.userId)
		}

		if (roles) {
			const isAuthorized = roles.some(role => session.roles.includes(role))
			return { ...session, isAuthorized }
		}
		return { ...session }
	}

	getSession(userId: string): Awaitable<TokenData | null> {
		return this.tokensByUserId[userId]
	}

	async checkRefreshToken(refreshToken: string): Promise<
		RefreshTokenData & { isExpired: boolean } | null
	> {
		const refreshTokenData = this.refreshTokens[refreshToken]
		if (!refreshTokenData) {
			return null
		}

		if (!verifyRefreshToken(refreshToken)) {
			return null
		}

		const isExpired = refreshTokenData.expiresAt < new Date()
		if (isExpired) {
			await this.revokeUserSessions(refreshTokenData.userId)
		}

		return { ...refreshTokenData, isExpired }
	}

	async createSession(userId: string, roles: string[]): Promise<Session> {
		await this.revokeUserSessions(userId)

		let token: string
		let refreshToken: string

		do {
			token = generateToken()
		} while (await this.checkToken(token))
		do {
			refreshToken = generateRefreshToken()
		} while (await this.checkRefreshToken(refreshToken))

		const issuedAt = new Date()
		const tokenExpiresAt = new Date(
			Date.now() + 1000 * env.AUTH_TOKEN_EXPIRATION_SECONDS
		)

		const tokenData: TokenData = {
			userId,
			roles,
			token,
			issuedAt,
			expiresAt: tokenExpiresAt,
		}
		this.insertToken(tokenData)

		const refreshTokenData: RefreshTokenData = {
			userId,
			refreshToken,
			issuedAt,
			expiresAt: new Date(
				Date.now() + 1000 * env.AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS
			),
		}
		this.insertRefreshToken(refreshTokenData)

		return { token, refreshToken, issuedAt, expiresAt: tokenExpiresAt }
	}

	revokeUserSessions(userId: string): Awaitable<void> {
		const token = this.tokensByUserId[userId]?.token
		const refreshToken = this.refreshTokensByUserId[userId]?.refreshToken
		if (token) this.deleteToken(token)
		if (refreshToken) this.deleteRefreshToken(refreshToken)
	}

	async reissueToken(userId: string, roles: UserRole[]): Promise<TokenData> {
		this.deleteToken(userId)

		let newTokenStr: string
		do {
			newTokenStr = generateToken()
		} while (await this.checkToken(newTokenStr))
		const newToken: TokenData = {
			userId: userId,
			roles: roles,
			token: newTokenStr,
			issuedAt: new Date(),
			expiresAt: new Date(Date.now() + 1000 * env.AUTH_TOKEN_EXPIRATION_SECONDS), // 30 days
		}
		this.insertToken(newToken)
		return newToken
	}

	private insertToken(data: TokenData): void {
		this.tokens[data.token] = data
		this.tokensByUserId[data.userId] = data
	}

	private insertRefreshToken(data: RefreshTokenData): void {
		this.refreshTokens[data.refreshToken] = data
		this.refreshTokensByUserId[data.userId] = data
	}

	private deleteToken(token: string): boolean {
		const session = this.tokens[token]
		delete this.tokens[token]
		delete this.tokensByUserId[session.userId]
		return !!session
	}

	private deleteRefreshToken(refreshToken: string): boolean {
		const session = this.refreshTokens[refreshToken]
		delete this.refreshTokens[refreshToken]
		delete this.refreshTokensByUserId[session.userId]
		return !!session
	}
}

type RedisClient = ReturnType<typeof createRedisClient>
export class RedisSessionStore extends SessionStore {
	private client: RedisClient
	private redisConnect: Promise<unknown>

	constructor() {
		super()
		this.client = createRedisClient({
			url: 'redis://' + env.REDIS_HOST + ':' + env.REDIS_PORT,
			password: env.REDIS_PASSWORD,
		})
		this.redisConnect = this.client.connect()
	}

	async createSession(userId: string, roles: string[]): Promise<Session> {
		await this.revokeUserSessions(userId)

		let token: string
		let refreshToken: string

		do {
			token = generateToken()
		} while (await this.checkToken(token))
		do {
			refreshToken = generateRefreshToken()
		} while (await this.checkRefreshToken(refreshToken))

		const issuedAt = new Date()
		const tokenExpiresAt = new Date(
			Date.now() + 1000 * env.AUTH_TOKEN_EXPIRATION_SECONDS
		)

		const tokenData: TokenData = {
			userId,
			roles,
			token,
			issuedAt,
			expiresAt: tokenExpiresAt,
		}
		await this.insertToken(tokenData)

		const refreshTokenData: RefreshTokenData = {
			userId,
			refreshToken,
			issuedAt,
			expiresAt: new Date(
				Date.now() + 1000 * env.AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS
			),
		}
		await this.insertRefreshToken(refreshTokenData)

		return { token, refreshToken, issuedAt, expiresAt: tokenExpiresAt }
	}

	async getSession(userId: string): Promise<TokenData | null> {
		await this.redisConnect

		const token = await this.client.get(`session/userId/${userId}`)
		if (!token) {
			return null
		}

		const data = await this.client.get(`session/token/${token}`)
		if (!data) {
			return null
		}

		return JSON.parse(data)
	}

	async checkToken(token: string): Promise<
		TokenData | null
	>
	async checkToken(token: string, roles: UserRole[]): Promise<
		TokenData & { isAuthorized: boolean } | null
	>
	async checkToken(token: string, roles?: UserRole[]): Promise<
		TokenData & { isAuthorized?: boolean } | null
	> {
		await this.redisConnect

		const data = await this.client.get(`session/token/${token}`)
		if (!data) {
			return null
		}

		const session = JSON.parse(data) as TokenData

		if (roles) {
			const isAuthorized = roles.some(role => session.roles.includes(role))
			return { ...session, isAuthorized }
		}
		return session
	}

	async checkRefreshToken(refreshToken: string): Promise<
		RefreshTokenData | null
	> {
		await this.redisConnect

		const value = await this.client.get(`refresh/token/${refreshToken}`)
		if (!value) {
			return null
		}

		const data = JSON.parse(value)
		return {
			...data,
			issuedAt: new Date(data.issuedAt),
		}
	}

	async reissueToken(userId: string, roles: UserRole[]): Promise<TokenData> {
		await this.redisConnect

		const newToken = {
			userId,
			roles,
			token: generateToken(),
			issuedAt: new Date(),
			expiresAt: new Date(Date.now() + 1000 * env.AUTH_TOKEN_EXPIRATION_SECONDS),
		}
		await this.insertToken(newToken)

		return newToken
	}

	async revokeUserSessions(userId: string): Promise<void> {
		await this.redisConnect

		const token = await this.client.get(`session/userId/${userId}`)
		const refreshToken = await this.client.get(`refresh/userId/${userId}`)
		if (token) {
			await this.client.del(`session/token/${token}`)
			await this.client.del(`session/userId/${userId}`)
		}
		if (refreshToken) {
			await this.client.del(`refresh/token/${refreshToken}`)
			await this.client.del(`refresh/userId/${userId}`)
		}
	}

	private async insertToken(data: TokenData): Promise<void> {
		await this.redisConnect

		const EX = env.AUTH_TOKEN_EXPIRATION_SECONDS
		await Promise.all([
			this.client.set(`session/token/${data.token}`, JSON.stringify(data), { EX }),
			this.client.set(`session/userId/${data.userId}`, data.token, { EX }),
		])
	}

	private async insertRefreshToken(data: RefreshTokenData): Promise<void> {
		await this.redisConnect

		const EX = env.AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS
		await Promise.all([
			this.client.set(`refresh/token/${data.refreshToken}`, JSON.stringify(data), { EX }),
			this.client.set(`refresh/userId/${data.userId}`, data.refreshToken, { EX }),
		])
	}
}

export function sessionToCookie(session: Session): readonly string[] {
	return [
		`token=${session.token}; HttpOnly; Path=/; Max-Age=${env.AUTH_TOKEN_EXPIRATION_SECONDS}`,
		`refreshToken=${session.refreshToken}; HttpOnly; Path=/; Max-Age=${env.AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS}`,
	]
}


export const sessionStore = new RedisSessionStore()
