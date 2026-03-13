
import { notifyUser } from '~/server/utils/notify';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { user1Id, user2Id, message } = body;

  if (!user1Id || !user2Id) {
    throw createError({ statusCode: 400, message: 'Missing user IDs' });
  }

  const defaultMsg = "Great news! You've been matched on Minutes 2 Match! Log in to see who it is and unlock their profile. - M2Match";
  const msg = message || defaultMsg;

  const results = await Promise.all([
    notifyUser(user1Id, msg).catch(err => ({ success: false, error: err.message })),
    notifyUser(user2Id, msg).catch(err => ({ success: false, error: err.message }))
  ]);

  return {
    success: true,
    results
  };
});
