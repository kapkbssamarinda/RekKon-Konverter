import { useMemo, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { FileQueue } from './components/FileQueue';
import { PreviewTable } from './components/PreviewTable';
import { SummaryBar } from './components/SummaryBar';
import { StepIndicator } from './components/StepIndicator';
import { SupportedBanks } from './components/SupportedBanks';
import { LoginPage } from './components/auth/LoginPage';
import { AdminPage } from './components/admin/AdminPage';
import { LoadingDots } from './components/ui/LoadingDots';
import { IconBox } from './components/ui/IconBox';
import { useFileProcessor } from './hooks/useFileProcessor';
import { useAuth } from './hooks/useAuth';
import { exportToExcel } from './services/excelExporter';
import { swalConfirmLogout, swalError } from './lib/swal';

type AppStep = 'upload' | 'processing' | 'done';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #EFF6FF 0%, #FAFCFF 40%, #F0FDF4 100%)',
    }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)', boxShadow: '0 4px 16px rgba(0,119,182,0.3)' }}
        >
          <svg width="26" height="26" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="18" height="14" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
            <path d="M5 9h12M5 13h8" stroke="#E0F4FF" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="17" cy="13" r="1.5" fill="#A5F3FC"/>
          </svg>
        </div>
        <LoadingDots />
      </div>
    </div>
  );
}

function App() {
  const { status, user, page, setPage, logout } = useAuth();
  const { files, statements, addFiles, removeFile, reset } = useFileProcessor();

  useEffect(() => {
    reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const step: AppStep = useMemo(() => {
    if (statements.length > 0) return 'done';
    if (files.some(f => f.status === 'processing' || f.status === 'queued')) return 'processing';
    return 'upload';
  }, [files, statements]);

  async function handleLogout() {
    const result = await swalConfirmLogout();
    if (result.isConfirmed) logout();
  }

  function handleExport() {
    if (statements.length === 0) return;
    try {
      exportToExcel(statements);
    } catch (err) {
      swalError(err instanceof Error ? err.message : 'Gagal mengekspor Excel', 'Gagal Export');
    }
  }

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'unauthenticated') return <LoginPage />;
  if (page === 'admin' && user?.role === 'admin') return <AdminPage />;

  const isTrial = user?.isTrial && user.trialExpiresAt;
  const trialDaysLeft = isTrial
    ? Math.ceil((new Date(user!.trialExpiresAt!).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div className="min-h-screen pb-[120px] sm:pb-[80px]" style={{
      background: 'linear-gradient(135deg, #EFF6FF 0%, #FAFCFF 40%, #F0FDF4 100%)',
      position: 'relative',
    }}>
      {/* Subtle geometric background pattern */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(0,180,216,0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0,119,182,0.05) 0%, transparent 40%),
            radial-gradient(circle at 60% 80%, rgba(16,185,129,0.04) 0%, transparent 40%)
          `,
          pointerEvents: 'none',
        }}
      />
      {/* Header — clean white, MediCare+ style */}
      <header
        className="animate-fade-in-scale relative"
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)', boxShadow: '0 2px 8px rgba(0,119,182,0.25)' }}
              >
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <rect x="2" y="4" width="18" height="14" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
                  <path d="M5 9h12M5 13h8" stroke="#E0F4FF" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="17" cy="13" r="1.5" fill="#A5F3FC"/>
                </svg>
              </div>
              <div>
                <h1 className="font-headline font-semibold text-[18px] tracking-tight" style={{ color: '#0F172A' }}>
                  RekKoran Converter
                </h1>
                <p className="font-body text-[12px] hidden sm:block" style={{ color: '#64748B' }}>
                  PDF Rekening Koran → Excel · Diproses lokal di browser
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <StepIndicator step={step} />
              </div>

              {/* Trial badge */}
              {isTrial && trialDaysLeft !== null && (
                <div
                  className="hidden sm:flex font-mono text-[11px] px-2.5 py-1 rounded"
                  style={{
                    background: trialDaysLeft <= 3 ? '#FEF2F2' : '#ECFDF5',
                    color: trialDaysLeft <= 3 ? '#DC2626' : '#059669',
                    border: `1px solid ${trialDaysLeft <= 3 ? '#FECACA' : '#A7F3D0'}`,
                    fontWeight: 600,
                  }}
                >
                  Trial · {trialDaysLeft}h
                </div>
              )}

              {/* User info */}
              <div
                className="hidden sm:flex font-body text-[12px] px-3 py-1.5 rounded-lg items-center gap-2"
                style={{
                  background: '#F8FAFC',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                }}
              >
                <span>{user?.username}</span>
              </div>

              {/* Admin button — secondary style */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setPage('admin')}
                  aria-label="Buka halaman Admin"
                  className="flex items-center justify-center gap-1.5 font-body text-[13px] w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-lg transition-colors"
                  style={{
                    background: '#FFFFFF',
                    color: '#0077B6',
                    border: '1.5px solid #0077B6',
                    fontWeight: 600,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F7FF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M0 14c0-2.5 2.7-4 6-4s6 1.5 6 4M9 12c.4-.8 1.6-2 3-2s2.6 1.2 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="hidden sm:inline" aria-hidden="true">Admin</span>
                </button>
              )}

              {/* Logout button — ghost destructive */}
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="flex items-center justify-center gap-1.5 font-body text-[13px] w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-lg transition-colors"
                style={{
                  background: '#FFFFFF',
                  color: '#64748B',
                  border: '1px solid #E2E8F0',
                  fontWeight: 600,
                }}
                onMouseEnter={e => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.color = '#DC2626';
                  btn.style.borderColor = '#FECACA';
                  btn.style.background = '#FEF2F2';
                }}
                onMouseLeave={e => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.color = '#64748B';
                  btn.style.borderColor = '#E2E8F0';
                  btn.style.background = '#FFFFFF';
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="hidden sm:inline" aria-hidden="true">Logout</span>
              </button>

              <div
                className="font-mono text-[11px] px-2 py-1 rounded"
                style={{ background: '#F0F7FF', color: '#64748B', border: '1px solid #E2E8F0' }}
              >
                v0.1.0
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="animate-fade-in-up delay-100">
            <DropZone onFiles={addFiles} />
          </div>
          <div className="animate-fade-in-up delay-200">
            <FileQueue files={files} onRemove={removeFile} />
          </div>
        </div>

        <div className="mt-10 animate-fade-in-up delay-300">
          <SupportedBanks />
        </div>

        {statements.length > 0 && (
          <div className="mt-10 animate-fade-in-up">
            <PreviewTable statements={statements} />
          </div>
        )}

        {/* Privacy Notice */}
        <div
          className="mt-10 animate-fade-in-up delay-400 flex items-start gap-4 px-5 py-4 relative overflow-hidden"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Gradient accent bar */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(to bottom, #0077B6, #00B4D8)',
              borderRadius: '12px 0 0 12px',
            }}
          />
          <IconBox size="md" bg="#F0F7FF">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M9 2L3 5.5V9c0 3 2.5 4.5 6 6 3.5-1.5 6-3 6-6V5.5L9 2Z" stroke="#0077B6" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M6.5 9l2 2 3-3" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconBox>
          <div>
            <p className="font-body font-semibold text-[13px]" style={{ color: '#0F172A' }}>
              100% Private & Secure
            </p>
            <p className="font-body text-[13px] mt-0.5" style={{ color: '#64748B', lineHeight: '1.55' }}>
              File PDF diproses langsung di browser. Tidak ada data yang dikirim ke server.
            </p>
          </div>
        </div>
      </main>

      <SummaryBar
        statements={statements}
        files={files}
        onExport={handleExport}
        onReset={reset}
      />
    </div>
  );
}

export default App;
