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
        className="flex flex-col items-center justify-center min-h-[220px] rounded-2xl"
        style={{ 
          background: '#FFFFFF',
          border: '1px dashed #E2E8F0'
        }}
      >
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
          style={{ background: '#F8FAFC' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 18V8a2 2 0 012-2h6l5 5v7a2 2 0 01-2 2H8a2 2 0 01-2-2Z" stroke="#CBD5E1" strokeWidth="1.5"/>
            <path d="M12 6v6h5" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="font-body text-[13px]" style={{ color: '#64748B' }}>No files yet</p>
        <p className="font-body text-[12px] mt-1" style={{ color: '#64748B' }}>Drop PDF files to upload</p>
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
