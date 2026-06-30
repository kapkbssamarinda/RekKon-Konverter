import type { PublicUser } from '../../types/auth';

interface Props {
  users: PublicUser[];
  currentUserId: string;
  onEdit: (user: PublicUser) => void;
  onDelete: (userId: string, username: string) => void;
}

function TrialCell({ user }: { user: PublicUser }) {
  if (!user.isTrial) {
    return (
      <span className="font-body text-[12px]" style={{ color: '#64748B' }}>
        Regular
      </span>
    );
  }

  const isExpired = user.trialExpiresAt ? new Date(user.trialExpiresAt) < new Date() : false;
  const days = user.trialExpiresAt
    ? Math.ceil((new Date(user.trialExpiresAt).getTime() - Date.now()) / 86_400_000)
    : null;
  const dateStr = user.trialExpiresAt
    ? new Date(user.trialExpiresAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="font-body text-[12px] font-medium"
        style={{ color: isExpired ? '#DC2626' : '#059669' }}
      >
        {isExpired ? 'Trial Expired' : days !== null ? `Trial · ${days} hari lagi` : 'Trial'}
      </span>
      {dateStr && (
        <span className="font-body text-[11px]" style={{ color: '#64748B' }}>
          s.d. {dateStr}
        </span>
      )}
    </div>
  );
}

function StatusDot({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: isActive ? '#22C55E' : '#CBD5E1' }}
      />
      <span className="font-body text-[12px]" style={{ color: isActive ? '#15803D' : '#64748B' }}>
        {isActive ? 'Aktif' : 'Nonaktif'}
      </span>
    </div>
  );
}

export function UserList({ users, currentUserId, onEdit, onDelete }: Props) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="21" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="22" cy="17" r="5.5" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M9 36c0-7 5.82-9 13-9s13 2 13 9" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="font-body text-[13px]" style={{ color: '#64748B' }}>Belum ada user</p>
      </div>
    );
  }

  return (
    <div>
      {/* Table header */}
      <div
        className="grid grid-user-list px-4 sm:px-6 py-2.5 font-body font-medium text-[11px] uppercase tracking-wider"
        style={{
          background: '#F8FAFC',
          borderBottom: '1px solid #F1F5F9',
          color: '#64748B',
        }}
      >
        <span>User</span>
        <span className="hidden sm:block">Status</span>
        <span className="hidden sm:block">Akun</span>
        <span />
      </div>

      {/* Rows */}
      {users.map((u, idx) => {
        const isSelf = u.id === currentUserId;
        const avatarBg = u.role === 'admin' ? '#F3E8FF' : '#EFF6FF';
        const avatarColor = u.role === 'admin' ? '#7C3AED' : '#2563EB';
        const trialExpired = u.isTrial && u.trialExpiresAt ? new Date(u.trialExpiresAt) < new Date() : false;

        return (
          <div
            key={u.id}
            className="grid grid-user-list items-center px-4 sm:px-6 py-3 sm:py-3.5 transition-colors duration-100"
            style={{
              borderTop: idx === 0 ? 'none' : '1px solid #F8FAFC',
              background: '#FFFFFF',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.background = '#FAFBFF';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.background = '#FFFFFF';
            }}
          >
            {/* Col 1: User info */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-headline font-bold text-[11px] flex-shrink-0"
                style={{ background: avatarBg, color: avatarColor }}
              >
                {u.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-body font-semibold text-[13px] truncate"
                    style={{ color: '#0F172A' }}
                  >
                    {u.username}
                  </span>
                  {isSelf && (
                    <span
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: '#F1F5F9', color: '#475569' }}
                    >
                      kamu
                    </span>
                  )}
                </div>
                {/* Mobile-only: inline status + trial */}
                <div className="flex items-center gap-1.5 mt-0.5 sm:hidden">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: u.isActive ? '#22C55E' : '#CBD5E1' }}
                  />
                  <span className="font-body text-[11px]" style={{ color: u.isActive ? '#15803D' : '#64748B' }}>
                    {u.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  {u.isTrial && (
                    <>
                      <span style={{ color: '#E2E8F0' }}>·</span>
                      <span className="font-body text-[11px]" style={{ color: trialExpired ? '#DC2626' : '#059669' }}>
                        {trialExpired ? 'Trial Expired' : 'Trial'}
                      </span>
                    </>
                  )}
                </div>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: u.role === 'admin' ? '#7C3AED' : '#64748B' }}
                >
                  {u.role}
                </span>
              </div>
            </div>

            {/* Col 2: Status — desktop only */}
            <div className="hidden sm:block">
              <StatusDot isActive={u.isActive} />
            </div>

            {/* Col 3: Trial info — desktop only */}
            <div className="hidden sm:block">
              <TrialCell user={u} />
            </div>

            {/* Col 4: Actions */}
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => onEdit(u)}
                className="w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-100"
                style={{ color: '#64748B' }}
                aria-label={`Edit user ${u.username}`}
                title="Edit"
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = '#EFF6FF';
                  el.style.color = '#2563EB';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = 'transparent';
                  el.style.color = '#64748B';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M11.5 2.5a2 2 0 0 1 2.83 2.83L5 14.66 2 15l.34-3L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </button>

              {!isSelf && (
                <button
                  onClick={() => onDelete(u.id, u.username)}
                  className="w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-100"
                  style={{ color: '#64748B' }}
                  aria-label={`Hapus user ${u.username}`}
                  title="Hapus"
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = '#FEF2F2';
                    el.style.color = '#DC2626';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = 'transparent';
                    el.style.color = '#64748B';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
