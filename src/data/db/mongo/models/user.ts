import crypto from "crypto"
import mongoose from "mongoose"

import { UserRole } from "@/data/types/auth"
import { isDev } from "@/env"

function hash(value: string | Buffer, secret: string | Buffer) {
	return crypto.createHmac('sha256', secret).update(value).digest()
}

export interface UserPublicKeyJWK {
	kty: 'EC'
	crv: 'P-521'
	x: string // base64url encoded
	y: string // base64url encoded
	ext: true
	key_ops?: ('deriveKey' | 'deriveBits')[]
}

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			index: true
		},

		passkeyHash: {
			type: Buffer,
			required: true,
		},
		passkeySalt: {
			type: Buffer,
			required: true,
		},

		publicKey: { // JSON Web Key (JWK) format
			type: Object,
			required: true,
		},

		roles: {
			type: [String],
			default: [UserRole.USER],
		}
	},
	{
		methods: {
			verifyPasskey(passkey: string) {
				return hash(passkey, this.passkeySalt).equals(this.passkeyHash)
			},
		},
		statics: {
			createWithPasskey(
				username: string,
				passkey: string,
				roles: string[] = [UserRole.USER],
				publicKey: UserPublicKeyJWK,
			) {
				const passkeySalt = crypto.randomBytes(32)
				const passkeyHash = hash(passkey, passkeySalt)
				return this.create({
					username,
					passkeySalt,
					passkeyHash,
					roles,
					publicKey,
				})
			}
		}
	}
)

UserSchema.index({ username: 1 }, { unique: true })

function generateModel() {
	const User = mongoose.model('User', UserSchema)

	if (isDev) {
		User.on('index', (err) => {
			if (err) {
				console.error('[DB] User index error: %s', err)
			} else {
				console.info('[DB] User indexing complete')
			}
		})
	}

	return User
}

const existingModel = mongoose.models.User as ReturnType<typeof generateModel>

export default existingModel ?? generateModel()