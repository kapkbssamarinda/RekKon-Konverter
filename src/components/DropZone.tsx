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
        cursor-pointer overflow-hidden
        transition-all duration-300
        select-none min-h-[220px] p-6
        ${isActive ? 'scale-[1.01]' : ''}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
      style={{
        background: isActive ? 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #F8FCFF 100%)',
        border: `2px dashed ${isActive ? '#00E5FF' : disabled ? '#E2E8F0' : '#90E0EF'}`,
        borderRadius: '16px',
        boxShadow: isActive
          ? '0 8px 32px rgba(0,119,182,0.25)'
          : '0 2px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Decorative gradient orbs */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,180,216,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute',
        bottom: '-20px',
        left: '-20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,119,182,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
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
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
        style={{
          background: isActive ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #E0F4FF 0%, #CCEEFF 100%)',
          border: `1px solid ${isActive ? 'rgba(255,255,255,0.4)' : '#90E0EF'}`,
          boxShadow: isActive ? '0 4px 16px rgba(0,180,216,0.3)' : '0 2px 8px rgba(0,119,182,0.1)',
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
            stroke={isActive ? '#A5F3FC' : '#48CAE4'}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Text Content */}
      <p
        className="font-body font-semibold text-[15px] text-center"
        style={{ color: isActive ? '#FFFFFF' : '#0F172A' }}
      >
        {isDragging ? '✨ Lepaskan untuk upload' : '📄 Drag & drop file PDF rekening koran'}
      </p>
      <p className="font-body text-[13px] mt-1.5 text-center" style={{ color: isActive ? 'rgba(255,255,255,0.85)' : '#64748B' }}>
        atau{' '}
        <span className="font-semibold cursor-pointer" style={{ color: isActive ? '#A5F3FC' : '#0077B6' }}>
          klik untuk pilih file
        </span>
      </p>
      <p className="font-body text-[12px] mt-2 text-center" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>
        Hanya file PDF · Beberapa file sekaligus didukung
      </p>
      
      {/* Elegant Notice */}
      <div 
        className="mt-4 flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 max-w-[280px]"
        style={{ 
          background: 'rgba(255,251,235,0.9)',
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
