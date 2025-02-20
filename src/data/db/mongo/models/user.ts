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

	passwordHash: {
		type: Buffer,
		required: true,
	},
	passwordSalt: {
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
			verifyPassword(password: string) {
				return hash(password, this.passwordSalt).equals(this.passwordHash)
			},
		},
		statics: {
			createWithPassword(username: string, password: string, roles: string[] = [UserRole.USER]) {
				const passwordSalt = crypto.randomBytes(32)
				const passwordHash = hash(password, passwordSalt)
				return this.create({ username, passwordSalt, passwordHash, roles })
			}
		}
	})

function generateModel() {
	return mongoose.model('User', UserSchema)
}

const existingModel = mongoose.models.User as ReturnType<typeof generateModel>

export default existingModel ?? generateModel()