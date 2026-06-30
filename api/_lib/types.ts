export interface User extends Record<string, unknown> {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
  isActive: string;       // 'true' | 'false' — Redis hash stores strings
  isTrial: string;        // 'true' | 'false'
  trialExpiresAt: string; // ISO 8601 or empty string
  createdAt: string;      // ISO 8601
}

export interface Session extends Record<string, unknown> {
  userId: string;
  username: string;
  role: 'admin' | 'user';
  expiresAt: string;      // ISO 8601
  isTrial: string;        // 'true' | 'false' — copied from User at login time
  trialExpiresAt: string; // ISO 8601 or empty string
}

export interface PublicUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
  isActive: boolean;
  isTrial: boolean;
  trialExpiresAt: string | null;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
  isTrial: boolean;
  trialExpiresAt: string | null;
}

export interface ApiResponse<T = null> {
  ok: boolean;
  data?: T;
  error?: string;
}

// Upstash hgetall may return boolean true instead of string 'true'
// because strings are stored raw (no JSON quotes) but read back via JSON.parse.
export function parseBool(val: unknown): boolean {
  return String(val) === 'true';
}

export function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    isActive: parseBool(u.isActive),
    isTrial: parseBool(u.isTrial),
    trialExpiresAt: u.trialExpiresAt || null,
    createdAt: u.createdAt,
  };
}

export function toAuthUser(u: User): AuthUser {
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    isTrial: u.isTrial === 'true',
    trialExpiresAt: u.trialExpiresAt || null,
  };
}
