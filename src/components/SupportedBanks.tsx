type BankStatus = 'supported' | 'coming-soon';

interface BankEntry {
  name: string;
  status: BankStatus;
}

const BANKS: BankEntry[] = [
  { name: 'Bank Mandiri', status: 'supported' },
  { name: 'Bank BNI', status: 'supported' },
  { name: 'Bank BRI', status: 'supported' },
  { name: 'Bank BCA', status: 'supported' },
  { name: 'SMBC Indonesia', status: 'coming-soon' },
];

const BANK_CONFIG: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'Bank Mandiri':   { bg: 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 100%)', text: '#D97706', border: '#FDE68A', gradient: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' },
  'Bank BNI':       { bg: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)', text: '#9333EA', border: '#E9D5FF', gradient: 'linear-gradient(135deg, #F3E8FF, #DDD6FE)' },
  'Bank BRI':       { bg: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)', text: '#DC2626', border: '#FECACA', gradient: 'linear-gradient(135deg, #FEF2F2, #FECACA)' },
  'Bank BCA':       { bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', text: '#2563EB', border: '#BFDBFE', gradient: 'linear-gradient(135deg, #EFF6FF, #BFDBFE)' },
  'SMBC Indonesia': { bg: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', text: '#4F46E5', border: '#C7D2FE', gradient: 'linear-gradient(135deg, #EEF2FF, #C7D2FE)' },
};

export function SupportedBanks() {
  const supportedCount = BANKS.filter(b => b.status === 'supported').length;
  
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: 'linear-gradient(to bottom, #0077B6, #00B4D8)' }}
        />
        <p className="font-body font-semibold text-[13px]" style={{ color: '#0F172A' }}>
          Supported Banks
        </p>
        <span 
          className="font-body text-[11px] px-2 py-0.5 rounded-full"
          style={{ 
            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
            color: '#059669',
            boxShadow: '0 1px 4px rgba(5,150,105,0.15)',
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
              className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: isSupported ? (config?.gradient || config?.bg) : 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
                border: `1px solid ${isSupported ? config?.border || '#E2E8F0' : '#E2E8F0'}`,
                boxShadow: isSupported ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {/* Status Indicator */}
              <span 
                className={`w-2 h-2 rounded-full ${isSupported ? '' : 'opacity-40'}`}
                style={{ 
                  background: isSupported 
                    ? '#10B981' 
                    : '#64748B',
                  boxShadow: isSupported ? '0 0 6px rgba(16,185,129,0.5)' : 'none',
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
                    background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)',
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
