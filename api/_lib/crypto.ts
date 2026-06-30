const ITERATIONS = 100_000;
const KEY_LENGTH = 32;

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    KEY_LENGTH * 8,
  );
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveKey(password, salt, ITERATIONS);
  const saltHex = Buffer.from(salt).toString('hex');
  const hashHex = Buffer.from(hash).toString('hex');
  return `pbkdf2:sha256:${ITERATIONS}:${saltHex}:${hashHex}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[2], 10);
  const salt = Buffer.from(parts[3], 'hex');
  const hash = await deriveKey(password, new Uint8Array(salt), iterations);
  const computed = Buffer.from(hash).toString('hex');
  return timingSafeEqual(computed, parts[4]);
}
