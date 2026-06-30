type AppStep = 'upload' | 'processing' | 'done';

const STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'processing', label: 'Process' },
  { key: 'done', label: 'Download' },
] as const;

interface Props {
  step: AppStep;
}

export function StepIndicator({ step }: Props) {
  const currentIndex = STEPS.findIndex(s => s.key === step);

  return (
    <div className="flex items-center gap-2" aria-label="Langkah konversi">
      {STEPS.map((s, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;

        return (
          <div key={s.key} className="flex items-center gap-2" aria-current={isActive ? 'step' : undefined}>
            <div className="flex items-center gap-2">
              {/* Step Circle */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-medium transition-all duration-300"
                style={{
                  background: isDone
                    ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)'
                    : isActive
                    ? 'linear-gradient(135deg, #E0F4FF, #CCEEFF)'
                    : 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
                  color: isDone
                    ? '#059669'
                    : isActive
                    ? '#0077B6'
                    : '#94A3B8',
                  border: isDone
                    ? '1px solid rgba(5, 150, 105, 0.3)'
                    : isActive
                    ? '1px solid rgba(0, 119, 182, 0.4)'
                    : '1px solid #E2E8F0',
                  boxShadow: isActive ? '0 2px 8px rgba(0,119,182,0.15)' : 'none',
                }}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <span
                className="font-body text-[12px] font-semibold hidden sm:block"
                style={{
                  color: isDone
                    ? '#059669'
                    : isActive
                    ? '#0077B6'
                    : '#94A3B8',
                }}
              >
                {s.label}
              </span>
            </div>
            
            {/* Connector Line */}
            {i < STEPS.length - 1 && (
              <div
                className="h-[1px] w-6 rounded-full transition-all duration-500"
                style={{
                  background: isDone 
                    ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)' 
                    : 'rgba(255, 255, 255, 0.1)'
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
