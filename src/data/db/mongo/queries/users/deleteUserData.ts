import { getDb } from '../../index';

/**
 * Deletes all data associated with a user from the database.
 * @param userId - The ID of the user whose data should be deleted.
 */
export async function deleteUserData(userId: string): Promise<void> {
  const db = await getDb();

  // Delete user data from the users collection
  await db.collection('users').deleteOne({ _id: userId });

  // Delete user's chats
  await db.collection('chats').deleteMany({ userId });

  // Delete user's market listings
  await db.collection('marketListings').deleteMany({ userId });

  // Add more deletions as necessary for other collections
}
