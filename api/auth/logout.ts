import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteSession } from '../_lib/session.js';
import { extractToken } from '../_lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = extractToken(req);
  if (token) {
    await deleteSession(token);
  }

  return res.status(200).json({ ok: true });
}
