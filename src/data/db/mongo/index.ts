import mongoose from "mongoose"

declare global {
	// Don't use let or const here

	// eslint-disable-next-line no-var
	var mongoose: {
		conn: mongoose.Mongoose | null,
		promise: Promise<mongoose.Mongoose> | null
	} | undefined
}

const MONGO_USERNAME = process.env.MONGO_USERNAME || "admin"
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || "password"
const MONGO_HOST = process.env.MONGO_HOST || "localhost"
const MONGO_PORT = process.env.MONGO_PORT || 27017
const MONGO_DB = process.env.MONGO_DB || "jadetrail"
const MONGO_URI = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`

if (!MONGO_HOST) {
	throw new Error("MONGO_HOST is required")
}
if (!MONGO_USERNAME || !MONGO_PASSWORD) {
	throw new Error("MONGO_USERNAME and MONGO_PASSWORD are required")
}


// Cached mongoose connection

let cached = globalThis.mongoose

async function dbConnect() {
	if (!cached) {
		cached = global.mongoose = { conn: null, promise: null }
	}

	if (cached.conn) {
		return cached.conn
	}

	if (!cached.promise) {
		console.log('Connecting to', `mongodb://${MONGO_USERNAME}:*****@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`)
		cached.promise = mongoose.connect(MONGO_URI)
	}
	cached.conn = await cached.promise
	return cached.conn
}

export default dbConnect