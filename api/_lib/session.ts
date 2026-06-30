import { nanoid } from 'nanoid';
import { redis } from './redis.js';
import type { Session, User } from './types.js';

const SESSION_PREFIX = 'session:';

function getTtl(): number {
  return parseInt(process.env.SESSION_TTL_SECONDS ?? '86400', 10);
}

export async function createSession(user: User): Promise<string> {
  const token = nanoid(48);
  const ttl = getTtl();
  const session: Session = {
    userId: user.id,
    username: user.username,
    role: user.role,
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    isTrial: user.isTrial,
    trialExpiresAt: user.trialExpiresAt,
  };
  await redis.hset(`${SESSION_PREFIX}${token}`, session);
  await redis.expire(`${SESSION_PREFIX}${token}`, ttl);
  return token;
}

export async function getSession(token: string): Promise<Session | null> {
  const data = await redis.hgetall<Session>(`${SESSION_PREFIX}${token}`);
  if (!data) return null;
  if (new Date(data.expiresAt) < new Date()) {
    await redis.del(`${SESSION_PREFIX}${token}`);
    return null;
  }
  return data;
}

export async function deleteSession(token: string): Promise<void> {
  await redis.del(`${SESSION_PREFIX}${token}`);
}
