import type { NextApiRequest, NextApiResponse } from 'next'

import User from '@/data/db/mongo/models/user'
import dbConnect from '@/data/db/mongo'
import { sessionStore } from '@/data/session'
import { Error as ApiError } from '@/data/types/common'
import { AuthData, protectedRoute } from '@/utils/api/auth'
import { deleteAllChatsByUserId } from '@/data/db/mongo/queries/chats/deleteAllChatsByUserId'
import { deleteAllMarketListingsByUserId } from '@/data/db/mongo/queries/market/deleteMarketListingsByUserId'

type Data = { success: boolean }

async function DELETE(
	req: NextApiRequest,
	res: NextApiResponse<Data | ApiError>,
	auth: AuthData,
) {
	await dbConnect()
	const user = await User.findById(auth.data.userId)
	if (!user) {
		res.status(401).json({ code: 'INVALID_CREDENTIALS' })
		return
	}

	await Promise.all([
		user.deleteOne(),
		deleteAllChatsByUserId(user.id),
		deleteAllMarketListingsByUserId(user.id),
	])

	// Separate this in case of an error with the deletion process
	await sessionStore.revokeUserSessions(user.id)

	// remove httpOnly cookies
	const dawnOfTime = new Date(0).toUTCString()
	res.setHeader('Set-Cookie', [
		`token=; Path=/; HttpOnly; SameSite=Strict; Expires=${dawnOfTime}`,
		`refreshToken=; Path=/; HttpOnly; SameSite=Strict; Expires=${dawnOfTime}`,
	])
	res.status(200).send({ success: true })
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data | ApiError>,
) {
	switch (req.method) {
		case 'DELETE':
			return await protectedRoute(DELETE, sessionStore)(req, res)
		default:
			res.status(405).end() // Method Not Allowed
	}
}