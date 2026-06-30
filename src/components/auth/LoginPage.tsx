import { useState, type FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ErrorBanner } from '../ui/ErrorBanner';
import bniLogo from '../../assets/logo/BNI.jpg';
import briLogo from '../../assets/logo/bri.png';
import mandiriLogo from '../../assets/logo/mandiri.png';

const BANKS = [
  { src: bniLogo, name: 'BNI' },
  { src: briLogo, name: 'BRI' },
  { src: mandiriLogo, name: 'Bank Mandiri' },
];

const MARQUEE_ITEMS = [...BANKS, ...BANKS];

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFCFF' }}>
      {/* Header */}
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#F0F7FF', border: '1px solid #90E0EF' }}
            >
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="18" height="14" rx="2" stroke="#0077B6" strokeWidth="1.5"/>
                <path d="M5 9h12M5 13h8" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="17" cy="13" r="1.5" fill="#059669"/>
              </svg>
            </div>
            <div>
              <h1 className="font-headline font-semibold text-[18px]" style={{ color: '#0F172A' }}>
                RekKoran Converter
              </h1>
              <p className="font-body text-[12px]" style={{ color: '#64748B' }}>
                PDF Rekening Koran → Excel
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Login Card + Marquee — centered together */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-8">
        <div
          className="w-full max-w-[420px] animate-fade-in-scale"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
            padding: '40px',
          }}
        >
          {/* Card Header */}
          <div className="mb-8">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
              style={{ background: '#F0F7FF', border: '1px solid #90E0EF' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <circle cx="11" cy="8" r="3.5" stroke="#0077B6" strokeWidth="1.5"/>
                <path d="M4 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="font-headline font-semibold" style={{ fontSize: '22px', color: '#0F172A', lineHeight: '1.3' }}>
              Masuk ke Akun
            </h2>
            <p className="font-body mt-1.5" style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.55' }}>
              Masukkan kredensial untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-username"
                className="font-body"
                style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Masukkan username"
                disabled={isLoading}
                className="px-4 py-2.5 input-field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="font-body"
                style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Masukkan password"
                disabled={isLoading}
                className="px-4 py-2.5 input-field"
              />
            </div>

            {error && <ErrorBanner message={error} />}

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full font-body transition-colors"
              style={{
                background: isLoading || !username || !password ? '#E2E8F0' : '#0077B6',
                color: isLoading || !username || !password ? '#94A3B8' : '#FFFFFF',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                minHeight: '44px',
                padding: '10px 24px',
                border: 'none',
                cursor: isLoading || !username || !password ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => {
                if (!isLoading && username && password)
                  (e.currentTarget as HTMLButtonElement).style.background = '#006399';
              }}
              onMouseLeave={e => {
                if (!isLoading && username && password)
                  (e.currentTarget as HTMLButtonElement).style.background = '#0077B6';
              }}
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Bank Logos Marquee */}
        <div className="w-full max-w-[420px] animate-fade-in-up" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <p
            className="text-center font-body pt-3 pb-2"
            style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.07em', background: '#F0F7FF' }}
          >
            FORMAT YANG DIDUKUNG
          </p>
          <p className="sr-only">BNI, BRI, Bank Mandiri</p>
          <div className="relative overflow-hidden py-3" style={{ background: '#F0F7FF' }} aria-hidden="true">
            <div
              className="absolute inset-y-0 left-0 w-14 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to right, #F0F7FF, transparent)' }}
            />
            <div
              className="absolute inset-y-0 right-0 w-14 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to left, #F0F7FF, transparent)' }}
            />
            <div className="flex animate-marquee" style={{ width: 'max-content' }}>
              {MARQUEE_ITEMS.map((bank, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center"
                  style={{ padding: '0 40px', flexShrink: 0 }}
                >
                  <img
                    src={bank.src}
                    alt=""
                    style={{ height: '26px', width: 'auto', maxWidth: '90px', objectFit: 'contain', opacity: 0.45 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
