interface Props {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onRetry, className = '' }: Props) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 animate-error-in ${className}`}
      style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
        <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5" />
        <path d="M8 5v4M8 11v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-body text-[13px] break-words flex-1" style={{ color: '#DC2626' }}>
        {message}
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-body text-[12px] font-medium underline flex-shrink-0"
          style={{ color: '#DC2626' }}
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}
