type BankStatus = 'supported' | 'coming-soon';

interface BankEntry {
  name: string;
  status: BankStatus;
}

const BANKS: BankEntry[] = [
  { name: 'Bank Mandiri', status: 'supported' },
  { name: 'Bank BNI', status: 'supported' },
  { name: 'Bank BRI', status: 'supported' },
  { name: 'Bank BCA', status: 'coming-soon' },
  { name: 'SMBC Indonesia', status: 'coming-soon' },
];

const BANK_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  'Bank Mandiri':   { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  'Bank BNI':       { bg: '#F3E8FF', text: '#9333EA', border: '#E9D5FF' },
  'Bank BRI':       { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  'Bank BCA':       { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  'SMBC Indonesia': { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
};

export function SupportedBanks() {
  const supportedCount = BANKS.filter(b => b.status === 'supported').length;
  
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: '#0077B6' }}
        />
        <p className="font-body font-semibold text-[13px]" style={{ color: '#0F172A' }}>
          Supported Banks
        </p>
        <span 
          className="font-body text-[11px] px-2 py-0.5 rounded-full"
          style={{ 
            background: '#ECFDF5',
            color: '#059669'
          }}
        >
          {supportedCount}/{BANKS.length}
        </span>
      </div>
      
      {/* Bank Cards */}
      <div className="flex flex-wrap gap-3">
        {BANKS.map((bank) => {
          const isSupported = bank.status === 'supported';
          const config = BANK_CONFIG[bank.name];
          
          return (
            <div
              key={bank.name}
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all duration-200"
              style={{
                background: isSupported ? config?.bg || '#F8FAFC' : '#F8FAFC',
                border: `1px solid ${isSupported ? config?.border || '#E2E8F0' : '#E2E8F0'}`,
              }}
            >
              {/* Status Indicator */}
              <span 
                className={`w-1.5 h-1.5 rounded-full ${isSupported ? '' : 'opacity-40'}`}
                style={{ 
                  background: isSupported 
                    ? '#10B981' 
                    : '#64748B'
                }}
              />
              
              {/* Bank Name */}
              <span
                className="font-body text-[13px] font-medium"
                style={{ 
                  color: isSupported 
                    ? (config?.text || '#0F172A') 
                    : '#64748B'
                }}
              >
                {bank.name}
              </span>
              
              {/* Status Badge */}
              {!isSupported && (
                <span 
                  className="font-body text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: '#F1F5F9',
                    color: '#64748B'
                  }}
                >
                  Soon
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
