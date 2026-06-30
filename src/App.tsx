import { useMemo, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { FileQueue } from './components/FileQueue';
import { PreviewTable } from './components/PreviewTable';
import { SummaryBar } from './components/SummaryBar';
import { StepIndicator } from './components/StepIndicator';
import { SupportedBanks } from './components/SupportedBanks';
import { LoginPage } from './components/auth/LoginPage';
import { AdminPage } from './components/admin/AdminPage';
import { useFileProcessor } from './hooks/useFileProcessor';
import { useAuth } from './hooks/useAuth';
import { exportToExcel } from './services/excelExporter';

type AppStep = 'upload' | 'processing' | 'done';

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.1) 100%)',
            border: '1px solid rgba(59,130,246,0.3)',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="4" width="18" height="14" rx="2" stroke="#60A5FA" strokeWidth="1.5"/>
            <path d="M5 9h12M5 13h8" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="17" cy="13" r="1.5" fill="#34D399"/>
          </svg>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full animate-dot-fade" style={{ background: '#3B82F6', animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full animate-dot-fade" style={{ background: '#3B82F6', animationDelay: '200ms' }} />
          <div className="w-2 h-2 rounded-full animate-dot-fade" style={{ background: '#3B82F6', animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const { status, user, page, setPage, logout } = useAuth();
  const { files, statements, addFiles, removeFile, reset } = useFileProcessor();

  // Clear converter state whenever a different user logs in
  useEffect(() => {
    reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const step: AppStep = useMemo(() => {
    if (statements.length > 0) return 'done';
    if (files.some(f => f.status === 'processing' || f.status === 'queued')) return 'processing';
    return 'upload';
  }, [files, statements]);

  function handleExport() {
    if (statements.length > 0) exportToExcel(statements);
  }

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'unauthenticated') return <LoginPage />;
  if (page === 'admin' && user?.role === 'admin') return <AdminPage />;

  const isTrial = user?.isTrial && user.trialExpiresAt;
  const trialDaysLeft = isTrial
    ? Math.ceil((new Date(user!.trialExpiresAt!).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div className="min-h-screen pb-[80px]" style={{ background: '#FAFBFC' }}>
      {/* Elegant Dark Header */}
      <header
        className="relative overflow-hidden animate-fade-in-scale"
        style={{
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
        }}
      >
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] border border-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/4 w-[200px] h-[200px] border border-white/20 rounded-full translate-y-1/2" />
        </div>

        {/* Accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #3B82F6 50%, transparent 100%)',
          }}
        />

        <div className="max-w-5xl mx-auto px-6 py-5 relative">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="4" width="18" height="14" rx="2" stroke="#60A5FA" strokeWidth="1.5"/>
                  <path d="M5 9h12M5 13h8" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="17" cy="13" r="1.5" fill="#34D399"/>
                </svg>
              </div>

              <div>
                <h1
                  className="font-headline font-semibold text-xl tracking-tight"
                  style={{ color: '#F8FAFC' }}
                >
                  RekKoran Converter
                </h1>
                <p className="font-body text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
                  PDF Rekening Koran → Excel · Processing happens locally
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <StepIndicator step={step} />

              {/* Trial badge */}
              {isTrial && trialDaysLeft !== null && (
                <div
                  className="font-mono text-[11px] px-2.5 py-1 rounded-lg"
                  style={{
                    background: trialDaysLeft <= 3 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.1)',
                    color: trialDaysLeft <= 3 ? '#FCA5A5' : '#6EE7B7',
                    border: `1px solid ${trialDaysLeft <= 3 ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.2)'}`,
                  }}
                >
                  Trial · {trialDaysLeft}h
                </div>
              )}

              {/* User info */}
              <div
                className="font-body text-[12px] px-3 py-1.5 rounded-lg flex items-center gap-2"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#CBD5E1',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span>{user?.username}</span>
              </div>

              {/* Admin button */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setPage('admin')}
                  className="flex items-center gap-1.5 font-body text-[12px] px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(139,92,246,0.12)',
                    color: '#C4B5FD',
                    border: '1px solid rgba(139,92,246,0.25)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.12)'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M0 14c0-2.5 2.7-4 6-4s6 1.5 6 4M9 12c.4-.8 1.6-2 3-2s2.6 1.2 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Admin
                </button>
              )}

              {/* Logout button */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 font-body text-[12px] px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#64748B',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748B'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>

              <div
                className="font-mono text-[11px] px-2.5 py-1 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#64748B',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                v0.1.0
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 pt-10">
        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="animate-fade-in-up delay-100">
            <DropZone onFiles={addFiles} />
          </div>
          <div className="animate-fade-in-up delay-200">
            <FileQueue files={files} onRemove={removeFile} />
          </div>
        </div>

        {/* Supported Banks */}
        <div className="mt-10 animate-fade-in-up delay-300">
          <SupportedBanks />
        </div>

        {/* Preview Table */}
        {statements.length > 0 && (
          <div className="mt-10 animate-fade-in-up">
            <PreviewTable statements={statements} />
          </div>
        )}

        {/* Privacy Notice */}
        <div
          className="mt-10 animate-fade-in-up delay-400 flex items-start gap-4 rounded-xl px-5 py-4"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#EFF6FF' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2L3 5.5V9c0 3 2.5 4.5 6 6 3.5-1.5 6-3 6-6V5.5L9 2Z"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M6.5 9l2 2 3-3" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="font-body font-medium text-[13px]" style={{ color: '#0F172A' }}>
              100% Private & Secure
            </p>
            <p className="font-body text-[12px] mt-0.5" style={{ color: '#64748B' }}>
              Your PDF files are processed directly in your browser. No data is ever sent to any server.
            </p>
          </div>
        </div>
      </main>

      {/* Summary Bar */}
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
