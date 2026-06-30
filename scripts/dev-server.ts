import express from 'express';
import type { Request, Response } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import loginHandler from '../api/auth/login.js';
import logoutHandler from '../api/auth/logout.js';
import meHandler from '../api/auth/me.js';
import usersHandler from '../api/admin/users.js';
import userByIdHandler from '../api/admin/users/[id].js';
import { redis } from '../api/_lib/redis.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (req: VercelRequest, res: VercelResponse) => any;

function mount(handler: Handler) {
  return (req: Request, res: Response) => {
    Promise.resolve(handler(req as unknown as VercelRequest, res as unknown as VercelResponse))
      .catch((err: unknown) => {
        console.error('[API Error]', req.method, req.path, err);
        if (!res.headersSent) {
          res.status(500).json({ ok: false, error: 'Internal server error' });
        }
      });
  };
}

const app = express();
app.use(express.json());

// Debug endpoint — test Redis connection and check if seed was run
app.get('/api/debug', async (_req, res) => {
  try {
    const userIds = await redis.smembers<string[]>('users');
    const userList = userIds && userIds.length > 0
      ? await Promise.all(userIds.map(id => redis.hgetall(`user:${id}`)))
      : [];
    res.json({
      ok: true,
      redis: 'connected',
      userCount: userIds?.length ?? 0,
      users: userList.map((u: Record<string, unknown> | null) => u ? {
        id: u['id'],
        username: u['username'],
        role: u['role'],
        isActive: u['isActive'],
        isActiveParsed: String(u['isActive']) === 'true',
        isTrial: u['isTrial'],
      } : null),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.all('/api/auth/login', mount(loginHandler));
app.all('/api/auth/logout', mount(logoutHandler));
app.all('/api/auth/me', mount(meHandler));
app.all('/api/admin/users', mount(usersHandler));
app.all('/api/admin/users/:id', mount(userByIdHandler));

// Test password verification against stored hash — dev only
app.get('/api/debug/verify', async (req, res) => {
  const password = req.query.password as string | undefined;
  const username = (req.query.username as string | undefined) ?? 'admin';
  if (!password) return void res.json({ error: 'Tambahkan ?password=... ke URL' });
  try {
    const { verifyPassword } = await import('../api/_lib/crypto.js');
    const userId = await redis.get<string>(`user:name:${username}`);
    if (!userId) return void res.json({ error: `User "${username}" tidak ditemukan` });
    const user = await redis.hgetall(`user:${userId}`) as Record<string, unknown>;
    const storedHash = user?.passwordHash as string | undefined;
    if (!storedHash) return void res.json({ error: 'passwordHash tidak ada di Redis' });
    const valid = await verifyPassword(password, storedHash);
    res.json({ username, password, hashPrefix: storedHash.slice(0, 30) + '...', valid });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/', (_req, res) => {
  res.send('<p style="font-family:sans-serif;padding:2rem">API server jalan di port 3000. Buka frontend di <a href="http://localhost:5173">http://localhost:5173</a></p>');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n✓ API server: http://localhost:${PORT}`);
  console.log(`  Debug:      http://localhost:${PORT}/api/debug`);
  console.log(`  Login:      POST http://localhost:${PORT}/api/auth/login\n`);
  const url = process.env.UPSTASH_REDIS_REST_URL;
  if (!url) {
    console.error('⚠ UPSTASH_REDIS_REST_URL tidak ditemukan — pastikan .env.local ada dan terisi\n');
  } else {
    console.log(`  Redis:      ${url.slice(0, 40)}...\n`);
  }
});
