import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from './session.js';
import { parseBool } from './types.js';
import type { Session } from './types.js';

export function extractToken(req: VercelRequest): string | null {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

function isTrialExpired(session: Session): boolean {
  if (!parseBool(session.isTrial)) return false;
  if (!session.trialExpiresAt) return false;
  return new Date(session.trialExpiresAt) < new Date();
}

export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse,
): Promise<Session | null> {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ ok: false, error: 'Authentication required' });
    return null;
  }
  const session = await getSession(token);
  if (!session) {
    res.status(401).json({ ok: false, error: 'Invalid or expired session' });
    return null;
  }
  if (isTrialExpired(session)) {
    res.status(403).json({ ok: false, error: 'Akun trial sudah kadaluarsa' });
    return null;
  }
  return session;
}

export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
): Promise<Session | null> {
  const session = await requireAuth(req, res);
  if (!session) return null;
  if (session.role !== 'admin') {
    res.status(403).json({ ok: false, error: 'Admin access required' });
    return null;
  }
  return session;
}
