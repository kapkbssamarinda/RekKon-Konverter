import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from '../_lib/redis.js';
import { verifyPassword } from '../_lib/crypto.js';
import { createSession } from '../_lib/session.js';
import { toAuthUser, parseBool } from '../_lib/types.js';
import type { User } from '../_lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'Username dan password wajib diisi' });
  }

  const userId = await redis.get<string>(`user:name:${username}`);
  if (!userId) {
    return res.status(401).json({ ok: false, error: 'Username atau password salah' });
  }

  const user = await redis.hgetall<User>(`user:${userId}`);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Username atau password salah' });
  }

  if (!parseBool(user.isActive)) {
    return res.status(401).json({ ok: false, error: 'Akun tidak aktif' });
  }

  if (parseBool(user.isTrial) && user.trialExpiresAt && new Date(user.trialExpiresAt) < new Date()) {
    return res.status(403).json({ ok: false, error: 'Akun trial sudah kadaluarsa' });
  }

  const valid = await verifyPassword(password, user.passwordHash as string);
  if (!valid) {
    return res.status(401).json({ ok: false, error: 'Username atau password salah' });
  }

  const token = await createSession(user);

  return res.status(200).json({
    ok: true,
    data: { token, user: toAuthUser(user) },
  });
}
