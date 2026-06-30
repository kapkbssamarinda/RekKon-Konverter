import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserList } from './UserList';
import { UserModal } from './UserModal';
import { ErrorBanner } from '../ui/ErrorBanner';
import { LoadingDots } from '../ui/LoadingDots';
import { IconBox } from '../ui/IconBox';
import type { PublicUser } from '../../types/auth';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; user: PublicUser };

export function AdminPage() {
  const { user, token, setPage, logout } = useAuth();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false });

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token]);

  async function fetchUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token!}` },
      });
      const body = (await res.json()) as { ok: boolean; data?: PublicUser[]; error?: string };
      if (!body.ok) throw new Error(body.error ?? 'Gagal memuat data');
      setUsers(body.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(userId: string, username: string) {
    if (!confirm(`Hapus user "${username}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token!}` },
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!body.ok) throw new Error(body.error ?? 'Gagal menghapus user');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  }

  function handleModalSuccess(savedUser: PublicUser) {
    if (modal.open && modal.mode === 'create') {
      setUsers(prev => [savedUser, ...prev]);
    } else {
      setUsers(prev => prev.map(u => (u.id === savedUser.id ? savedUser : u)));
    }
    setModal({ open: false });
  }

  const trialCount = users.filter(
    u => u.isTrial && u.trialExpiresAt && new Date(u.trialExpiresAt) > new Date(),
  ).length;
  const expiredCount = users.filter(
    u => u.isTrial && u.trialExpiresAt && new Date(u.trialExpiresAt) <= new Date(),
  ).length;

  const stats = [
    {
      label: 'Total User',
      value: users.length,
      color: '#2563EB',
      bg: '#EFF6FF',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="7" cy="7" r="3" stroke="#2563EB" strokeWidth="1.5" />
          <circle cx="14" cy="7" r="3" stroke="#2563EB" strokeWidth="1.5" />
          <path d="M1 17c0-3 2.7-5 6-5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 17c0-3 1.3-5 4-5 2.2 0 4.5 1.6 5 5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Trial Aktif',
      value: trialCount,
      color: '#059669',
      bg: '#ECFDF5',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="#059669" strokeWidth="1.5" />
          <path d="M9 5.5V9l2.5 2.5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Trial Expired',
      value: expiredCount,
      color: '#DC2626',
      bg: '#FEF2F2',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="#DC2626" strokeWidth="1.5" />
          <path d="M6.5 6.5l5 5M11.5 6.5l-5 5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F1F5F9' }}>
      {/* Header */}
      <header
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
          boxShadow: '0 4px 20px rgba(15,23,42,0.15)',
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #3B82F6 50%, transparent 100%)' }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="7" cy="7" r="3" stroke="#60A5FA" strokeWidth="1.5" />
                  <circle cx="14" cy="7" r="3" stroke="#60A5FA" strokeWidth="1.5" />
                  <path d="M1 17c0-3 2.7-5 6-5" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M10 17c0-3 1.3-5 4-5 2.2 0 4.5 1.6 5 5" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="font-headline font-semibold text-[17px] leading-tight" style={{ color: '#F8FAFC' }}>
                  Manajemen User
                </h1>
                <p className="font-body text-[11px] mt-0.5" style={{ color: '#64748B' }}>
                  Login sebagai <span style={{ color: '#93C5FD' }}>{user?.username}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage('app')}
                className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 rounded-xl font-body text-[13px] font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 7h8M4 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="hidden sm:inline">Converter</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 rounded-xl font-body text-[13px] font-medium transition-all"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-7 pb-16">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {stats.map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[30px] font-bold leading-none" style={{ color: '#0F172A' }}>
                  {isLoading ? '—' : stat.value}
                </p>
                <p className="font-body text-[12px] mt-2" style={{ color: '#64748B' }}>
                  {stat.label}
                </p>
              </div>
              <IconBox size="md" bg={stat.bg}>
                {stat.icon}
              </IconBox>
            </div>
          ))}
        </div>

        {/* Users Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 6px rgba(15,23,42,0.06)' }}
        >
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4"
            style={{ borderBottom: '1px solid #F1F5F9' }}
          >
            <div>
              <h2 className="font-headline font-semibold text-[15px]" style={{ color: '#0F172A' }}>
                Daftar User
              </h2>
              <p className="font-body text-[12px] mt-0.5" style={{ color: '#64748B' }}>
                {isLoading ? 'Memuat...' : `${users.length} user terdaftar`}
              </p>
            </div>
            <button
              onClick={() => setModal({ open: true, mode: 'create' })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-body font-semibold text-[13px] text-white"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Tambah User
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingDots />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorBanner message={error} onRetry={fetchUsers} />
            </div>
          ) : (
            <UserList
              users={users}
              currentUserId={user!.id}
              onEdit={u => setModal({ open: true, mode: 'edit', user: u })}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      {modal.open && (
        <UserModal
          mode={modal.mode}
          user={modal.mode === 'edit' ? modal.user : undefined}
          token={token!}
          onSuccess={handleModalSuccess}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
