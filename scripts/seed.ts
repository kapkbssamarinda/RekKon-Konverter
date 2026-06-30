import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';

async function hashPassword(password: string): Promise<string> {
  const ITERATIONS = 100_000;
  const KEY_LENGTH = 32;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
    keyMaterial,
    KEY_LENGTH * 8,
  );
  const saltHex = Buffer.from(salt).toString('hex');
  const hashHex = Buffer.from(hash).toString('hex');
  return `pbkdf2:sha256:${ITERATIONS}:${saltHex}:${hashHex}`;
}

async function seed() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!url || !token) {
    console.error('Error: UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN harus diset di .env.local');
    process.exit(1);
  }
  if (!username || !password) {
    console.error('Error: ADMIN_USERNAME dan ADMIN_PASSWORD harus diset di .env.local');
    process.exit(1);
  }

  console.log(`Password yang akan di-hash: "${password}" (${password.length} karakter)`);

  const redis = new Redis({ url, token });
  const forceReset = process.argv.includes('--reset');

  const existingId = await redis.get<string>(`user:name:${username}`);

  if (existingId && !forceReset) {
    console.log(`\nAdmin "${username}" sudah ada (id: ${existingId}).`);
    console.log('Untuk update password, jalankan: npm run seed -- --reset');
    process.exit(0);
  }

  if (existingId && forceReset) {
    const passwordHash = await hashPassword(password);
    await redis.hset(`user:${existingId}`, { passwordHash });
    console.log(`✓ Password admin "${username}" berhasil diupdate.`);
    process.exit(0);
  }

  const id = nanoid(16);
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  await redis.hset(`user:${id}`, {
    id,
    username,
    passwordHash,
    role: 'admin',
    isActive: 'true',
    isTrial: 'false',
    trialExpiresAt: '',
    createdAt: now,
  });
  await redis.set(`user:name:${username}`, id);
  await redis.sadd('users', id);

  console.log(`✓ Admin "${username}" berhasil dibuat (id: ${id})`);
}

seed().catch((err: unknown) => {
  console.error('Seed gagal:', err);
  process.exit(1);
});
