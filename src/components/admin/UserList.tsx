import type { PublicUser } from '../../types/auth';

interface Props {
  users: PublicUser[];
  currentUserId: string;
  onEdit: (user: PublicUser) => void;
  onDelete: (userId: string, username: string) => void;
}

// Combines trial type + expiry date into one column
function TrialCell({ user }: { user: PublicUser }) {
  if (!user.isTrial) {
    return (
      <span className="font-body text-[12px]" style={{ color: '#94A3B8' }}>
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
        <span className="font-body text-[11px]" style={{ color: '#CBD5E1' }}>
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
      <span className="font-body text-[12px]" style={{ color: isActive ? '#15803D' : '#94A3B8' }}>
        {isActive ? 'Aktif' : 'Nonaktif'}
      </span>
    </div>
  );
}

const COL = 'minmax(0,2fr) 90px 180px 72px';

export function UserList({ users, currentUserId, onEdit, onDelete }: Props) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="21" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="22" cy="17" r="5.5" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M9 36c0-7 5.82-9 13-9s13 2 13 9" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="font-body text-[13px]" style={{ color: '#94A3B8' }}>Belum ada user</p>
      </div>
    );
  }

  return (
    <div>
      {/* Table header */}
      <div
        className="grid px-6 py-2.5 font-body font-medium text-[11px] uppercase tracking-wider"
        style={{
          gridTemplateColumns: COL,
          background: '#F8FAFC',
          borderBottom: '1px solid #F1F5F9',
          color: '#94A3B8',
        }}
      >
        <span>User</span>
        <span>Status</span>
        <span>Akun</span>
        <span />
      </div>

      {/* Rows */}
      {users.map((u, idx) => {
        const isSelf = u.id === currentUserId;
        const avatarBg = u.role === 'admin' ? '#F3E8FF' : '#EFF6FF';
        const avatarColor = u.role === 'admin' ? '#7C3AED' : '#2563EB';

        return (
          <div
            key={u.id}
            className="grid items-center px-6 py-3.5 transition-colors duration-100"
            style={{
              gridTemplateColumns: COL,
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
                      style={{ background: '#F1F5F9', color: '#94A3B8' }}
                    >
                      kamu
                    </span>
                  )}
                </div>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: u.role === 'admin' ? '#7C3AED' : '#94A3B8' }}
                >
                  {u.role}
                </span>
              </div>
            </div>

            {/* Col 2: Status */}
            <StatusDot isActive={u.isActive} />

            {/* Col 3: Trial info */}
            <TrialCell user={u} />

            {/* Col 4: Actions */}
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => onEdit(u)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-100"
                style={{ color: '#94A3B8' }}
                title="Edit"
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = '#EFF6FF';
                  el.style.color = '#2563EB';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = 'transparent';
                  el.style.color = '#94A3B8';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M11.5 2.5a2 2 0 0 1 2.83 2.83L5 14.66 2 15l.34-3L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </button>

              {!isSelf && (
                <button
                  onClick={() => onDelete(u.id, u.username)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-100"
                  style={{ color: '#94A3B8' }}
                  title="Hapus"
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = '#FEF2F2';
                    el.style.color = '#DC2626';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = 'transparent';
                    el.style.color = '#94A3B8';
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
