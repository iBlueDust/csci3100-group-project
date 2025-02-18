import { UserRole } from "./types/auth"
import { generateRefreshToken, generateToken, verifyRefreshToken, verifyToken } from "@/utils/api/auth"

interface TokenData {
	userId: string
	roles: string[]
	token: string
	issuedAt: Date
	expiresAt: Date
}

interface RefreshTokenData {
	userId: string
	refreshToken: string
	issuedAt: Date
	expiresAt: Date
}

interface Session {
	token: string
	refreshToken: string
	issuedAt: Date
}

const AUTH_TOKEN_EXPIRATION_SECONDS =
	!Number.isNaN(parseInt(process.env.AUTH_TOKEN_EXPIRATION_SECONDS ?? '')) ?
		parseInt(process.env.AUTH_TOKEN_EXPIRATION_SECONDS ?? '') :
		60 * 5 // 5 minutes
const AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS =
	!Number.isNaN(parseInt(process.env.AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS ?? '')) ?
		parseInt(process.env.AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS ?? '') :
		60 * 60 * 6 // 6 hours

export type Awaitable<T> = T | Promise<T>

export abstract class SessionStore {
	abstract createSession(userId: string, roles: string[]): Awaitable<Session>

	abstract getSession(userId: string): Awaitable<TokenData>

	abstract checkToken(token: string): Awaitable<
		TokenData & { isExpired: boolean } | null
	>
	abstract checkToken(token: string, roles: UserRole[]): Awaitable<
		TokenData & { isExpired: boolean, isAuthorized: boolean } | null
	>

	abstract checkRefreshToken(refreshToken: string): Awaitable<
		RefreshTokenData & { isExpired: boolean } | null
	>

	abstract reissueToken(userId: string, roles: string[]): Awaitable<string>

	abstract revokeUserSessions(userId: string): Awaitable<void>
}

export class InMemorySessionStore extends SessionStore {
	private tokensByUserId: Record<string, TokenData> = {}
	private tokens: Record<string, TokenData> = {}

	private refreshTokensByUserId: Record<string, RefreshTokenData> = {}
	private refreshTokens: Record<string, RefreshTokenData> = {}

	checkToken(token: string): Awaitable<
		TokenData & { isExpired: boolean } | null
	>
	checkToken(token: string, roles: UserRole[]): Awaitable<
		TokenData & { isExpired: boolean, isAuthorized: boolean } | null
	>
	checkToken(token: string, roles?: UserRole[]): Awaitable<
		TokenData & { isExpired: boolean, isAuthorized?: boolean } | null
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
			return { ...session, isExpired, isAuthorized }
		}
		return { ...session, isExpired }
	}

	getSession(userId: string): Awaitable<TokenData> {
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
		// Ensure tokens are unique
		do {
			token = generateToken()
		} while (await this.checkToken(token))
		do {
			refreshToken = generateRefreshToken()
		} while (await this.checkRefreshToken(refreshToken))

		const issuedAt = new Date()

		const tokenData: TokenData = {
			userId,
			roles,
			token,
			issuedAt,
			expiresAt: new Date(Date.now() + 1000 * AUTH_TOKEN_EXPIRATION_SECONDS), // 30 days
		}
		this.insertToken(tokenData)

		const refreshTokenData: RefreshTokenData = {
			userId,
			refreshToken,
			issuedAt,
			expiresAt: new Date(Date.now() + 1000 * AUTH_REFRESH_TOKEN_EXPIRATION_SECONDS), // 30 days
		}
		this.insertRefreshToken(refreshTokenData)

		return { token, refreshToken, issuedAt }
	}

	revokeUserSessions(userId: string): Awaitable<void> {
		const token = this.tokensByUserId[userId]?.token
		const refreshToken = this.refreshTokensByUserId[userId]?.refreshToken
		if (token) this.deleteToken(token)
		if (refreshToken) this.deleteRefreshToken(refreshToken)
	}

	async reissueToken(userId: string, roles: UserRole[]): Promise<string> {
		this.deleteToken(userId)

		let newToken: string
		do {
			newToken = generateToken()
		} while (await this.checkToken(newToken))
		const newTokenData: TokenData = {
			userId: userId,
			roles: roles,
			token: newToken,
			issuedAt: new Date(),
			expiresAt: new Date(Date.now() + 1000 * AUTH_TOKEN_EXPIRATION_SECONDS), // 30 days
		}
		this.insertToken(newTokenData)
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

export const sessionStore = new InMemorySessionStore()
