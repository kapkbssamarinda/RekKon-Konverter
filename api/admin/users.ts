import type { VercelRequest, VercelResponse } from '@vercel/node';
import { nanoid } from 'nanoid';
import { requireAdmin } from '../_lib/middleware.js';
import { redis } from '../_lib/redis.js';
import { hashPassword } from '../_lib/crypto.js';
import { toPublicUser } from '../_lib/types.js';
import type { User } from '../_lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const session = await requireAdmin(req, res);
    if (!session) return;

    if (req.method === 'GET') {
      const userIds = await redis.smembers<string[]>('users');
      if (!userIds || userIds.length === 0) {
        return res.status(200).json({ ok: true, data: [] });
      }
      const users = await Promise.all(
        userIds.map(id => redis.hgetall<User>(`user:${id}`)),
      );
      const publicUsers = users
        .filter((u): u is User => u !== null)
        .map(toPublicUser)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.status(200).json({ ok: true, data: publicUsers });
    }

    if (req.method === 'POST') {
      const body = req.body as {
        username?: string;
        password?: string;
        role?: 'admin' | 'user';
        isTrial?: boolean;
        trialExpiresAt?: string;
      } | null;

      if (!body) {
        return res.status(400).json({ ok: false, error: 'Request body kosong' });
      }

      const {
        username,
        password,
        role = 'user',
        isTrial = false,
        trialExpiresAt = '',
      } = body;

      if (!username || !password) {
        return res.status(400).json({ ok: false, error: 'Username dan password wajib diisi' });
      }
      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ ok: false, error: 'Role tidak valid' });
      }

      const existing = await redis.get(`user:name:${username}`);
      if (existing) {
        return res.status(409).json({ ok: false, error: 'Username sudah digunakan' });
      }

      const id = nanoid(16);
      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();

      const user: User = {
        id,
        username,
        passwordHash,
        role,
        isActive: 'true',
        isTrial: isTrial ? 'true' : 'false',
        trialExpiresAt: trialExpiresAt || '',
        createdAt: now,
      };

      await redis.hset(`user:${id}`, user);
      await redis.set(`user:name:${username}`, id);
      await redis.sadd('users', id);

      return res.status(201).json({ ok: true, data: toPublicUser(user) });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/admin/users]', err);
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
}
