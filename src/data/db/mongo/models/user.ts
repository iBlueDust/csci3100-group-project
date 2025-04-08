import { UserRole } from "@/data/types/auth"
import crypto from "crypto"
import mongoose from "mongoose"

function hash(value: string | Buffer, secret: string | Buffer) {
	return crypto.createHmac('sha256', secret).update(value).digest()
}

const UserSchema = new mongoose.Schema({
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
			createWithPasskey(username: string, passkey: string, roles: string[] = [UserRole.USER]) {
				const passkeySalt = crypto.randomBytes(32)
				const passkeyHash = hash(passkey, passkeySalt)
				return this.create({ username, passkeySalt, passkeyHash, roles })
			}
		}
	})

function generateModel() {
	return mongoose.model('User', UserSchema)
}

const existingModel = mongoose.models.User as ReturnType<typeof generateModel>

export default existingModel ?? generateModel()