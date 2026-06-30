import type { BankStatement } from '../parsers/types';
import type { FileItem } from '../hooks/useFileProcessor';

interface Props {
  statements: BankStatement[];
  files: FileItem[];
  onExport: () => void;
  onReset: () => void;
}

export function SummaryBar({ statements, files, onExport, onReset }: Props) {
  const totalTx = statements.reduce((s, stmt) => s + stmt.transactions.length, 0);
  const banks = new Set(statements.map(s => s.bankName)).size;
  const doneFiles = files.filter(f => f.status === 'done').length;
  const hasResults = statements.length > 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 backdrop-blur-xl z-50"
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        borderTop: '1px solid #E2E8F0',
        boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.06)'
      }}
    >
      {/* Top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ 
          background: 'linear-gradient(90deg, transparent 0%, #E2E8F0 20%, #E2E8F0 80%, transparent 100%)'
        }}
      />
      
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Stats */}
          <div className="flex items-center gap-8">
            {/* Transactions */}
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: '#EFF6FF' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h12M2 12h8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="font-mono text-[18px] font-semibold" style={{ color: '#0F172A' }}>
                  {totalTx.toLocaleString('id-ID')}
                </p>
                <p className="font-body text-[11px]" style={{ color: '#64748B' }}>Transactions</p>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-[1px] h-8" style={{ background: '#E2E8F0' }} />
            
            {/* Banks */}
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: '#F3E8FF' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="#9333EA" strokeWidth="1.5"/>
                  <path d="M2 6.5h12M5 4V2.5M11 4V2.5" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="font-mono text-[18px] font-semibold" style={{ color: '#0F172A' }}>{banks}</p>
                <p className="font-body text-[11px]" style={{ color: '#64748B' }}>Banks</p>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-[1px] h-8" style={{ background: '#E2E8F0' }} />
            
            {/* Files */}
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: '#ECFDF5' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3v10a1 1 0 001 1h8a1 1 0 001-1V6l-4-3H4a1 1 0 00-1 1z" stroke="#059669" strokeWidth="1.5"/>
                  <path d="M8 2v3.5h3.5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="font-mono text-[18px] font-semibold" style={{ color: '#0F172A' }}>{doneFiles}</p>
                <p className="font-body text-[11px]" style={{ color: '#64748B' }}>Files</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {files.length > 0 && (
              <button
                onClick={onReset}
                className="
                  font-body font-medium rounded-xl px-5 h-11
                  transition-all duration-200
                  hover-lift
                "
                style={{ 
                  background: '#FFFFFF',
                  color: '#64748B',
                  border: '1px solid #E2E8F0'
                }}
              >
                Reset
              </button>
            )}
            <button
              onClick={onExport}
              disabled={!hasResults}
              className="
                font-body font-medium rounded-xl px-5 h-11
                flex items-center gap-2
                transition-all duration-200
                disabled:cursor-not-allowed
                hover-lift
              "
              style={{ 
                background: hasResults 
                  ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' 
                  : '#E2E8F0',
                color: hasResults ? '#FFFFFF' : '#94A3B8',
                boxShadow: hasResults 
                  ? '0 4px 12px rgba(37, 99, 235, 0.3)' 
                  : 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 2v7M5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
