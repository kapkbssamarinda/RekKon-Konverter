import { useRef, useState, type DragEvent } from 'react';

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (dropped.length > 0) onFiles(dropped);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) onFiles(selected);
    e.target.value = '';
  }

  const isActive = isDragging && !disabled;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload PDF rekening koran — klik atau tekan Enter untuk pilih file"
      aria-disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center
        cursor-pointer
        transition-all duration-300
        select-none min-h-[220px] p-6
        ${isActive ? 'scale-[1.01]' : ''}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
      style={{
        background: isActive ? '#F0F7FF' : '#FFFFFF',
        border: `2px dashed ${isActive ? '#0077B6' : disabled ? '#E2E8F0' : '#CBD5E1'}`,
        borderRadius: '8px',
        boxShadow: isActive
          ? '0 4px 12px rgba(0,119,182,0.10)'
          : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Elegant Icon Container */}
      <div
        className={`w-14 h-14 rounded-lg flex items-center justify-center mb-5 transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
        style={{
          background: isActive ? '#0077B6' : '#F0F7FF',
          border: `1px solid ${isActive ? '#006399' : '#90E0EF'}`,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path
            d="M6 20V10a2 2 0 012-2h8l6 6v4a2 2 0 01-2 2H8a2 2 0 01-2-2Z"
            stroke={isActive ? '#FFFFFF' : '#0077B6'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 8v6h6"
            stroke={isActive ? '#FFFFFF' : '#0077B6'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 15h5M10 18h3"
            stroke={isActive ? '#FFFFFF' : '#48CAE4'}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Text Content */}
      <p
        className="font-body font-semibold text-[15px] text-center"
        style={{ color: isActive ? '#0077B6' : '#0F172A' }}
      >
        {isDragging ? 'Lepaskan untuk upload' : 'Drag & drop file PDF rekening koran'}
      </p>
      <p className="font-body text-[13px] mt-1.5 text-center" style={{ color: '#64748B' }}>
        atau{' '}
        <span className="font-semibold cursor-pointer" style={{ color: '#0077B6' }}>
          klik untuk pilih file
        </span>
      </p>
      <p className="font-body text-[12px] mt-2 text-center" style={{ color: '#94A3B8' }}>
        Hanya file PDF · Beberapa file sekaligus didukung
      </p>
      
      {/* Elegant Notice */}
      <div 
        className="mt-4 flex items-start gap-2.5 rounded-lg px-3.5 py-2.5 max-w-[280px]"
        style={{ 
          background: '#FFFBEB',
          border: '1px solid #FDE68A'
        }}
      >
        <svg 
          className="flex-shrink-0 mt-0.5" 
          width="14" 
          height="14" 
          viewBox="0 0 14 14" 
          fill="none"
        >
          <path 
            d="M7 1L13 12H1L7 1Z" 
            stroke="#D97706" 
            strokeWidth="1.2" 
            strokeLinejoin="round"
          />
          <path 
            d="M7 5.5v3M7 9.5v.5" 
            stroke="#D97706" 
            strokeWidth="1.2" 
            strokeLinecap="round"
          />
        </svg>
        <p 
          className="font-body text-[11px] leading-[1.5]"
          style={{ color: '#92400E' }}
        >
          Only direct bank exports. Scanned PDFs cannot be processed.
        </p>
      </div>
    </div>
  );
}
