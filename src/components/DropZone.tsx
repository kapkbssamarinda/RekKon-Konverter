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
        rounded-2xl cursor-pointer
        transition-all duration-300 ease-out
        select-none min-h-[220px] p-6
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${isActive ? 'scale-[1.01]' : ''}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
      style={{
        background: isActive 
          ? 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)' 
          : '#FFFFFF',
        border: `1px solid ${isActive ? '#3B82F6' : disabled ? '#E2E8F0' : '#E2E8F0'}`,
        boxShadow: isActive 
          ? '0 8px 30px rgba(59, 130, 246, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.1)' 
          : '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)'
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
        className={`
          w-14 h-14 rounded-xl flex items-center justify-center mb-5
          transition-all duration-300
          ${isActive ? 'scale-110 animate-glow-pulse' : ''}
        `}
        style={{ 
          background: isActive 
            ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' 
            : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)'
        }}
      >
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 28 28" 
          fill="none"
          className={isActive ? '' : 'opacity-70'}
        >
          <path
            d="M6 20V10a2 2 0 012-2h8l6 6v4a2 2 0 01-2 2H8a2 2 0 01-2-2Z"
            stroke={isActive ? '#FFFFFF' : '#64748B'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M14 8v6h6" 
            stroke={isActive ? '#FFFFFF' : '#64748B'} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M10 15h5M10 18h3" 
            stroke={isActive ? '#FFFFFF' : '#64748B'} 
            strokeWidth="1.2" 
            strokeLinecap="round"
            opacity={isActive ? '1' : '0.6'}
          />
        </svg>
      </div>

      {/* Text Content */}
      <p 
        className="font-body font-medium text-[15px] text-center"
        style={{ color: isActive ? '#1E40AF' : '#0F172A' }}
      >
        {isDragging ? 'Release to upload files' : 'Drag & drop PDF bank statements'}
      </p>
      <p 
        className="font-body text-[13px] mt-1.5 text-center"
        style={{ color: '#64748B' }}
      >
        or <span 
          className="font-medium cursor-pointer"
          style={{ color: isActive ? '#1E40AF' : '#2563EB' }}
        >
          click to browse
        </span>
      </p>
      <p 
        className="font-body text-[12px] mt-2 text-center"
        style={{ color: '#94A3B8' }}
      >
        PDF files only · Multiple files supported
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
