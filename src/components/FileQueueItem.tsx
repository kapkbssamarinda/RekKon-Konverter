import type { FileItem } from '../hooks/useFileProcessor';

const BANK_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  'Mandiri': { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  'BRI':     { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  'BCA':     { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  'BNI':     { bg: '#F3E8FF', text: '#9333EA', border: '#E9D5FF' },
  'SMBC':    { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
  'Kopra':   { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
};

interface Props {
  item: FileItem;
  onRemove: (id: string) => void;
}

export function FileQueueItem({ item, onRemove }: Props) {
  const bankConfig = item.bankDetected ? BANK_CONFIG[item.bankDetected] : null;

  const statusConfig = () => {
    switch (item.status) {
      case 'queued':
        return { 
          bg: '#F8FAFC', 
          text: '#64748B',
          border: '#E2E8F0',
          dot: '#94A3B8'
        };
      case 'processing':
        return { 
          bg: '#EFF6FF', 
          text: '#2563EB',
          border: '#BFDBFE',
          dot: '#3B82F6'
        };
      case 'done':
        return { 
          bg: '#ECFDF5', 
          text: '#059669',
          border: '#A7F3D0',
          dot: '#10B981'
        };
      case 'error':
        return { 
          bg: '#FEF2F2', 
          text: '#DC2626',
          border: '#FECACA',
          dot: '#EF4444'
        };
    }
  };

  const status = statusConfig();
  const fileSizeKb = Math.round(item.file.size / 1024);

  return (
    <div 
      className="rounded-xl p-4 transition-all duration-200 hover-lift"
      style={{ 
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)',
        border: '1px solid #E2E8F0'
      }}
    >
      <div className="flex items-center gap-3">
        {/* Bank Icon */}
        <div className="flex-shrink-0">
          {bankConfig ? (
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                background: bankConfig.bg,
                border: `1px solid ${bankConfig.border}`
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="5" width="14" height="8" rx="1.5" stroke={bankConfig.text} strokeWidth="1.5"/>
                <path d="M2 7.5h14M5 5V3M13 5V3" stroke={bankConfig.text} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          ) : (
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#F1F5F9' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 4v10a1 1 0 001 1h10a1 1 0 001-1V7l-4-3H4a1 1 0 00-1 1z" stroke="#94A3B8" strokeWidth="1.5"/>
                <path d="M9 2v4h4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="font-body font-medium text-[14px] truncate" style={{ color: '#0F172A' }}>
            {item.file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-body text-[12px]" style={{ color: '#94A3B8' }}>
              {fileSizeKb} KB
            </span>
            {bankConfig && (
              <>
                <span style={{ color: '#E2E8F0' }}>·</span>
                <span 
                  className="font-body text-[11px] font-medium"
                  style={{ color: bankConfig.text }}
                >
                  {item.bankDetected}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <div 
          className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-[12px] font-medium"
          style={{ 
            background: status.bg,
            border: `1px solid ${status.border}`,
            color: status.text
          }}
        >
          <span 
            className={`w-1.5 h-1.5 rounded-full ${item.status === 'processing' ? 'animate-subtle-pulse' : ''}`}
            style={{ background: status.dot }}
          />
          <span>
            {item.status === 'queued' && 'Waiting'}
            {item.status === 'processing' && 'Processing'}
            {item.status === 'done' && 'Done'}
            {item.status === 'error' && 'Failed'}
          </span>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          className="
            flex-shrink-0 w-8 h-8 rounded-lg 
            flex items-center justify-center
            transition-all duration-150
          "
          style={{ 
            background: '#F8FAFC',
            color: '#94A3B8'
          }}
          title="Remove"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      {item.status === 'processing' && (
        <div className="mt-3 h-[3px] rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
          <div
            className="h-full rounded-full relative overflow-hidden"
            style={{ 
              width: `${item.progress}%`,
              background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)'
            }}
          >
            <div 
              className="absolute inset-0 animate-shimmer"
              style={{ 
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
              }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {item.status === 'error' && item.errorMsg && (
        <div 
          className="mt-3 p-2.5 rounded-lg"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
        >
          <p className="font-body text-[12px]" style={{ color: '#DC2626' }}>
            {item.errorMsg}
          </p>
        </div>
      )}
    </div>
  );
}
