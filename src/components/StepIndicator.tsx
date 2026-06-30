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
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;

        return (
          <div key={s.key} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {/* Step Circle */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-medium transition-all duration-300"
                style={{
                  background: isDone 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : isActive 
                    ? 'rgba(59, 130, 246, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  color: isDone 
                    ? '#34D399' 
                    : isActive 
                    ? '#60A5FA' 
                    : '#64748B',
                  border: isDone 
                    ? '1px solid rgba(16, 185, 129, 0.3)' 
                    : isActive 
                    ? '1px solid rgba(59, 130, 246, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.1)'
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
                className="font-body text-[12px] font-medium hidden sm:block"
                style={{
                  color: isDone 
                    ? '#34D399' 
                    : isActive 
                    ? '#94A3B8' 
                    : '#475569'
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
