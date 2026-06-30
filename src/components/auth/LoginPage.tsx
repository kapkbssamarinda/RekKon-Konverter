import { useState, type FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import bniLogo from '../../assets/logo/BNI.jpg';
import briLogo from '../../assets/logo/bri.png';
import mandiriLogo from '../../assets/logo/mandiri.png';

const BANKS = [
  { src: bniLogo, name: 'BNI' },
  { src: briLogo, name: 'BRI' },
  { src: mandiriLogo, name: 'Bank Mandiri' },
];

// duplicate for seamless loop
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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 60%, #FAFBFC 100%)' }}
    >
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)' }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] border border-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #3B82F6 50%, transparent 100%)' }}
        />
        <div className="max-w-5xl mx-auto px-6 py-5 relative">
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.1) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="4" width="18" height="14" rx="2" stroke="#60A5FA" strokeWidth="1.5"/>
                <path d="M5 9h12M5 13h8" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="17" cy="13" r="1.5" fill="#34D399"/>
              </svg>
            </div>
            <div>
              <h1 className="font-headline font-semibold text-xl tracking-tight" style={{ color: '#F8FAFC' }}>
                RekKoran Converter
              </h1>
              <p className="font-body text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
                PDF Rekening Koran → Excel
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          className="w-full max-w-[400px] rounded-2xl p-8 animate-fade-in-scale"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15), 0 4px 16px rgba(15, 23, 42, 0.08)',
          }}
        >
          {/* Card Header */}
          <div className="mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: '#EFF6FF' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="8" r="3.5" stroke="#2563EB" strokeWidth="1.5"/>
                <path d="M4 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="font-headline font-semibold text-[22px]" style={{ color: '#0F172A' }}>
              Masuk ke Akun
            </h2>
            <p className="font-body text-[13px] mt-1" style={{ color: '#64748B' }}>
              Masukkan kredensial untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body font-medium text-[13px]" style={{ color: '#374151' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Masukkan username"
                disabled={isLoading}
                className="w-full rounded-xl px-4 py-3 font-body text-[14px] outline-none transition-all"
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  color: '#0F172A',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.background = '#FFFFFF'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body font-medium text-[13px]" style={{ color: '#374151' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Masukkan password"
                disabled={isLoading}
                className="w-full rounded-xl px-4 py-3 font-body text-[14px] outline-none transition-all"
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  color: '#0F172A',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.background = '#FFFFFF'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/>
                  <path d="M8 5v4M8 11v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="font-body text-[13px] break-words" style={{ color: '#DC2626' }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="mt-2 w-full rounded-xl py-3.5 font-body font-semibold text-[14px] text-white transition-all"
              style={{
                background: isLoading || !username || !password
                  ? '#94A3B8'
                  : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: isLoading || !username || !password
                  ? 'none'
                  : '0 4px 12px rgba(37, 99, 235, 0.4)',
                cursor: isLoading || !username || !password ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>

      {/* Bank Logos Marquee */}
      <div style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <p
          className="text-center font-body pt-4 pb-3"
          style={{ fontSize: '11px', color: '#64748B' }}
        >
          Format rekening koran yang didukung
        </p>
        <div className="relative overflow-hidden pb-5">
          {/* Left fade mask */}
          <div
            className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #F8FAFC, transparent)' }}
          />
          {/* Right fade mask */}
          <div
            className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #F8FAFC, transparent)' }}
          />
          {/* Scrolling track */}
          <div className="flex animate-marquee" style={{ width: 'max-content' }}>
            {MARQUEE_ITEMS.map((bank, i) => (
              <div
                key={i}
                className="flex items-center justify-center"
                style={{ padding: '0 52px', flexShrink: 0 }}
              >
                <img
                  src={bank.src}
                  alt={bank.name}
                  style={{
                    height: '28px',
                    width: 'auto',
                    maxWidth: '100px',
                    objectFit: 'contain',
                    opacity: 0.45,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
