import { useState, useEffect, type FormEvent } from 'react';
import type { PublicUser } from '../../types/auth';

function Toggle({
  checked,
  onChange,
  disabled,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
      <div>
        <p className="font-body font-medium text-[13px]" style={{ color: '#374151' }}>{label}</p>
        {description && (
          <p className="font-body text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 focus:outline-none"
        style={{ background: checked ? '#2563EB' : '#CBD5E1' }}
      >
        <span
          className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ left: '3px', transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
        />
      </button>
    </label>
  );
}

interface Props {
  mode: 'create' | 'edit';
  user?: PublicUser;
  token: string;
  onSuccess: (user: PublicUser) => void;
  onClose: () => void;
}

type TrialMode = 'date' | 'duration';
type TrialUnit = 'jam' | 'hari';

export function UserModal({ mode, user, token, onSuccess, onClose }: Props) {
  const [username, setUsername] = useState(user?.username ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>(user?.role ?? 'user');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [isTrial, setIsTrial] = useState(user?.isTrial ?? false);
  const [trialMode, setTrialMode] = useState<TrialMode>('date');
  const [trialExpiresAt, setTrialExpiresAt] = useState(
    user?.trialExpiresAt ? user.trialExpiresAt.slice(0, 10) : '',
  );
  const [trialDuration, setTrialDuration] = useState(24);
  const [trialUnit, setTrialUnit] = useState<TrialUnit>('jam');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isTrial) {
      setTrialExpiresAt('');
      setTrialDuration(24);
      setTrialUnit('jam');
      setTrialMode('date');
    }
  }, [isTrial]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    let expiresAt = '';
    if (isTrial) {
      if (trialMode === 'date' && trialExpiresAt) {
        expiresAt = new Date(trialExpiresAt).toISOString();
      } else if (trialMode === 'duration' && trialDuration > 0) {
        const ms = trialUnit === 'jam'
          ? trialDuration * 3_600_000
          : trialDuration * 86_400_000;
        expiresAt = new Date(Date.now() + ms).toISOString();
      }
    }

    try {
      const body: Record<string, unknown> = {
        username,
        role,
        isTrial,
        trialExpiresAt: expiresAt,
      };
      if (mode === 'create') {
        body.password = password;
      } else if (password) {
        body.password = password;
        body.isActive = isActive;
      } else {
        body.isActive = isActive;
      }

      const url = mode === 'create' ? '/api/admin/users' : `/api/admin/users/${user!.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok: boolean; data?: PublicUser; error?: string };
      if (!data.ok) throw new Error(data.error ?? 'Operasi gagal');
      onSuccess(data.data!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = {
    background: '#F8FAFC',
    border: '1.5px solid #E2E8F0',
    color: '#0F172A',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.65)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[480px] rounded-2xl p-5 sm:p-6 animate-fade-in-scale max-h-[90dvh] overflow-y-auto"
        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(15,23,42,0.2)' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline font-semibold text-[18px]" style={{ color: '#0F172A' }}>
            {mode === 'create' ? 'Tambah User' : 'Edit User'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-[13px]" style={{ color: '#374151' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Masukkan username"
              className="rounded-xl px-4 py-3 font-body text-[14px] outline-none transition-all"
              style={inputStyle}
              onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#93C5FD'; }}
              onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#E2E8F0'; }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-[13px]" style={{ color: '#374151' }}>
              Password{' '}
              {mode === 'edit' && (
                <span style={{ color: '#94A3B8', fontWeight: 400 }}>— kosongkan jika tidak diubah</span>
              )}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={mode === 'create'}
              disabled={isLoading}
              placeholder={mode === 'create' ? 'Masukkan password' : '••••••••'}
              className="rounded-xl px-4 py-3 font-body text-[14px] outline-none transition-all"
              style={inputStyle}
              onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#93C5FD'; }}
              onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#E2E8F0'; }}
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-[13px]" style={{ color: '#374151' }}>Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'admin' | 'user')}
              disabled={isLoading}
              className="rounded-xl px-4 py-3 font-body text-[14px] outline-none transition-all"
              style={inputStyle}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #F1F5F9', margin: '2px 0' }} />

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            {mode === 'edit' && (
              <Toggle
                checked={isActive}
                onChange={setIsActive}
                disabled={isLoading}
                label="Akun Aktif"
                description="Nonaktifkan untuk mencabut akses tanpa menghapus akun"
              />
            )}
            <Toggle
              checked={isTrial}
              onChange={setIsTrial}
              disabled={isLoading}
              label="Akun Trial"
              description="Akses otomatis dicabut setelah tanggal berakhir"
            />
          </div>

          {/* Trial Expiry Config */}
          {isTrial && (
            <div
              className="flex flex-col gap-3 rounded-xl p-4"
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
            >
              {/* Mode selector */}
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#E2E8F0' }}>
                {(['date', 'duration'] as TrialMode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setTrialMode(m)}
                    className="flex-1 py-1.5 rounded-md font-body font-medium text-[12px] transition-all"
                    style={
                      trialMode === m
                        ? { background: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 3px rgba(15,23,42,0.1)' }
                        : { background: 'transparent', color: '#64748B' }
                    }
                  >
                    {m === 'date' ? 'Tanggal' : 'Durasi'}
                  </button>
                ))}
              </div>

              {/* Date picker */}
              {trialMode === 'date' && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-[12px] font-medium" style={{ color: '#64748B' }}>
                    Berakhir pada
                  </label>
                  <input
                    type="date"
                    value={trialExpiresAt}
                    onChange={e => setTrialExpiresAt(e.target.value)}
                    required
                    disabled={isLoading}
                    className="rounded-xl px-4 py-2.5 font-body text-[13px] outline-none transition-all"
                    style={{ ...inputStyle, background: '#FFFFFF' }}
                    onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#93C5FD'; }}
                    onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#E2E8F0'; }}
                  />
                </div>
              )}

              {/* Duration picker */}
              {trialMode === 'duration' && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-[12px] font-medium" style={{ color: '#64748B' }}>
                    Berlaku selama
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      max={trialUnit === 'jam' ? 8760 : 365}
                      value={trialDuration}
                      onChange={e => setTrialDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      required
                      disabled={isLoading}
                      className="w-24 rounded-xl px-4 py-2.5 font-mono text-[14px] outline-none transition-all text-center"
                      style={{ ...inputStyle, background: '#FFFFFF' }}
                      onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#93C5FD'; }}
                      onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#E2E8F0'; }}
                    />
                    <select
                      value={trialUnit}
                      onChange={e => {
                        const next = e.target.value as TrialUnit;
                        setTrialUnit(next);
                        if (next === 'jam' && trialDuration > 8760) setTrialDuration(24);
                        if (next === 'hari' && trialDuration > 365) setTrialDuration(7);
                      }}
                      disabled={isLoading}
                      className="flex-1 rounded-xl px-4 py-2.5 font-body text-[13px] outline-none transition-all"
                      style={{ ...inputStyle, background: '#FFFFFF' }}
                    >
                      <option value="jam">Jam</option>
                      <option value="hari">Hari</option>
                    </select>
                  </div>
                  {/* Quick presets */}
                  <div className="flex gap-1.5 flex-wrap mt-0.5">
                    {(trialUnit === 'jam'
                      ? [1, 3, 6, 12, 24, 48]
                      : [3, 7, 14, 30]
                    ).map(v => (
                      <button
                        key={v}
                        type="button"
                        disabled={isLoading}
                        onClick={() => setTrialDuration(v)}
                        className="px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all"
                        style={
                          trialDuration === v
                            ? { background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }
                            : { background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }
                        }
                      >
                        {v}{trialUnit === 'jam' ? 'j' : 'h'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/>
                <path d="M8 5v4M8 11v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="font-body text-[13px]" style={{ color: '#DC2626' }}>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl py-3 font-body font-medium text-[14px] transition-colors"
              style={{ background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-xl py-3 font-body font-semibold text-[14px] text-white"
              style={{
                background: isLoading ? '#94A3B8' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: isLoading ? 'none' : '0 4px 12px rgba(37,99,235,0.35)',
              }}
            >
              {isLoading ? 'Menyimpan...' : mode === 'create' ? 'Tambah User' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
