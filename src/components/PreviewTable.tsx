import type { BankStatement } from '../parsers/types';
import { IconBox } from './ui/IconBox';

interface Props {
  statements: BankStatement[];
}

const MAX_ROWS = 20;

function formatNumber(n: number | null | ''): string {
  if (n === null || n === '') return '-';
  return n.toLocaleString('id-ID', { minimumFractionDigits: 2 });
}

export function PreviewTable({ statements }: Props) {
  if (statements.length === 0) return null;

  const allTx = statements.flatMap(stmt =>
    stmt.transactions.map(tx => ({ ...tx, bankName: stmt.bankName }))
  );

  const displayed = allTx.slice(0, MAX_ROWS);
  const remaining = allTx.length - MAX_ROWS;

  return (
    <div className="animate-fade-in-up">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5">
        <IconBox size="sm" bg="#F0F7FF">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h8" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </IconBox>
        <div>
          <h2 className="font-headline font-semibold text-lg" style={{ color: '#0F172A' }}>
            Transaction Preview
          </h2>
          <p className="font-body text-[12px]" style={{ color: '#64748B' }}>
            Showing first {displayed.length} of {allTx.length.toLocaleString('id-ID')} transactions
          </p>
        </div>
      </div>
      
      {/* Table Container */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: '#F0F7FF', borderBottom: '2px solid #90E0EF' }}>
                {[
                  { label: 'Date', sortable: true },
                  { label: 'Bank', sortable: true },
                  { label: 'Description', sortable: false },
                  { label: 'Debit', sortable: true, align: 'right' },
                  { label: 'Credit', sortable: true, align: 'right' },
                  { label: 'Balance', sortable: true, align: 'right' },
                ].map((h) => (
                  <th
                    key={h.label}
                    className="px-4 py-3 font-body font-semibold text-[12px] uppercase tracking-wide"
                    style={{ textAlign: h.align === 'right' ? 'right' : 'left', color: '#0077B6' }}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((tx, idx) => (
                <tr
                  key={idx}
                  className={`
                    transition-colors duration-150
                    hover:bg-slate-50
                    ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                  `}
                  style={{
                    borderBottom: idx < displayed.length - 1 ? '1px solid #F1F5F9' : 'none',
                    animation: 'fadeInUp 250ms cubic-bezier(0.25, 1, 0.5, 1) both',
                    animationDelay: `${Math.min(idx, 12) * 25}ms`,
                  }}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-[13px]" style={{ color: '#475569' }}>
                      {tx.postingDate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className="font-body text-[12px] font-medium rounded-md px-2 py-1"
                      style={{ 
                        background: '#F1F5F9',
                        color: '#475569'
                      }}
                    >
                      {tx.bankName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className="font-body text-[13px] max-w-[280px] truncate block"
                      style={{ color: '#334155' }}
                    >
                      {tx.remark}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {tx.debit != null ? (
                      <span 
                        className="font-mono text-[13px] px-2 py-0.5 rounded"
                        style={{ 
                          background: '#FEF2F2',
                          color: '#DC2626'
                        }}
                      >
                        {formatNumber(tx.debit)}
                      </span>
                    ) : (
                      <span className="font-mono text-[13px]" style={{ color: '#94A3B8' }}>-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {tx.credit != null ? (
                      <span 
                        className="font-mono text-[13px] px-2 py-0.5 rounded"
                        style={{ 
                          background: '#ECFDF5',
                          color: '#059669'
                        }}
                      >
                        {formatNumber(tx.credit)}
                      </span>
                    ) : (
                      <span className="font-mono text-[13px]" style={{ color: '#94A3B8' }}>-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-[13px] font-medium" style={{ color: '#0F172A' }}>
                      {formatNumber(tx.balance)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        {remaining > 0 && (
          <div 
            className="px-4 py-3"
            style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}
          >
            <p className="font-body text-[12px]" style={{ color: '#64748B' }}>
              and <span className="font-medium" style={{ color: '#0F172A' }}>{remaining.toLocaleString('id-ID')}</span> more transactions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
