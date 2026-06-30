import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/middleware.js';
import { redis } from '../_lib/redis.js';
import { toAuthUser } from '../_lib/types.js';
import type { User } from '../_lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const session = await requireAuth(req, res);
  if (!session) return;

  const user = await redis.hgetall<User>(`user:${session.userId}`);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'User not found' });
  }

  return res.status(200).json({ ok: true, data: toAuthUser(user) });
}
