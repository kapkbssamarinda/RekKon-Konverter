export interface Config {
  mergeSheets: boolean;
}

interface Props {
  config: Config;
  onChange: (c: Config) => void;
}

export function ConfigChips({ config, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-body text-[12px]" style={{ color: '#64748B' }}>Output:</span>
      <button
        onClick={() => onChange({ ...config, mergeSheets: true })}
        className="font-body text-[13px] rounded-lg px-3.5 py-1.5 min-h-[36px] transition-all duration-150"
        style={{
          background: config.mergeSheets 
            ? '#EFF6FF' 
            : '#FFFFFF',
          color: config.mergeSheets 
            ? '#2563EB' 
            : '#64748B',
          border: `1px solid ${config.mergeSheets ? '#BFDBFE' : '#E2E8F0'}`
        }}
      >
        Combined
      </button>
      <button
        onClick={() => onChange({ ...config, mergeSheets: false })}
        className="font-body text-[13px] rounded-lg px-3.5 py-1.5 min-h-[36px] transition-all duration-150"
        style={{
          background: !config.mergeSheets 
            ? '#EFF6FF' 
            : '#FFFFFF',
          color: !config.mergeSheets 
            ? '#2563EB' 
            : '#64748B',
          border: `1px solid ${!config.mergeSheets ? '#BFDBFE' : '#E2E8F0'}`
        }}
      >
        Per Bank
      </button>
    </div>
  );
}
