import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../_lib/middleware.js';
import { redis } from '../../_lib/redis.js';
import { hashPassword } from '../../_lib/crypto.js';
import { toPublicUser } from '../../_lib/types.js';
import type { User } from '../../_lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const session = await requireAdmin(req, res);
    if (!session) return;

    const id = req.query.id as string | undefined;
    if (!id) {
      return res.status(400).json({ ok: false, error: 'User ID diperlukan' });
    }

    const user = await redis.hgetall<User>(`user:${id}`);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User tidak ditemukan' });
    }

    if (req.method === 'PATCH') {
      const {
        username,
        password,
        role,
        isActive,
        isTrial,
        trialExpiresAt,
      } = (req.body ?? {}) as {
        username?: string;
        password?: string;
        role?: 'admin' | 'user';
        isActive?: boolean;
        isTrial?: boolean;
        trialExpiresAt?: string;
      };

      const updates: Partial<User> = {};

      if (username !== undefined && username !== user.username) {
        const taken = await redis.get(`user:name:${username}`);
        if (taken && taken !== id) {
          return res.status(409).json({ ok: false, error: 'Username sudah digunakan' });
        }
        await redis.del(`user:name:${user.username}`);
        await redis.set(`user:name:${username}`, id);
        updates.username = username;
      }

      if (password !== undefined && password !== '') {
        updates.passwordHash = await hashPassword(password);
      }
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.isActive = isActive ? 'true' : 'false';
      if (isTrial !== undefined) updates.isTrial = isTrial ? 'true' : 'false';
      if (trialExpiresAt !== undefined) updates.trialExpiresAt = trialExpiresAt;

      if (Object.keys(updates).length > 0) {
        await redis.hset(`user:${id}`, updates);
      }

      const updated = await redis.hgetall<User>(`user:${id}`);
      if (!updated) {
        return res.status(500).json({ ok: false, error: 'Gagal mengambil data user' });
      }

      return res.status(200).json({ ok: true, data: toPublicUser(updated) });
    }

    if (req.method === 'DELETE') {
      if (session.userId === id) {
        return res.status(400).json({ ok: false, error: 'Tidak bisa menghapus akun sendiri' });
      }
      await redis.del(`user:${id}`);
      await redis.del(`user:name:${user.username}`);
      await redis.srem('users', id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/admin/users/[id]]', err);
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
}
