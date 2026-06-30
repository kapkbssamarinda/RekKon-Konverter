import type { FileItem } from '../hooks/useFileProcessor';
import { FileQueueItem } from './FileQueueItem';

interface Props {
  files: FileItem[];
  onRemove: (id: string) => void;
}

export function FileQueue({ files, onRemove }: Props) {
  if (files.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-[220px] rounded-2xl relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FCFF 100%)',
          border: '1px dashed #90E0EF',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Decorative orb */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
          style={{ background: 'linear-gradient(135deg, #E0F4FF 0%, #CCEEFF 100%)', boxShadow: '0 2px 8px rgba(0,119,182,0.1)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 18V8a2 2 0 012-2h6l5 5v7a2 2 0 01-2 2H8a2 2 0 01-2-2Z" stroke="#0077B6" strokeWidth="1.5"/>
            <path d="M12 6v6h5" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="font-body text-[13px]" style={{ color: '#64748B' }}>Belum ada file</p>
        <p className="font-body text-[12px] mt-1" style={{ color: '#94A3B8' }}>Drop PDF files untuk upload</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {files.map(item => (
        <div key={item.id} className="animate-item-in">
          <FileQueueItem item={item} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
