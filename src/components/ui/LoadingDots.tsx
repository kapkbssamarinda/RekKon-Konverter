interface Props {
  color?: string;
  size?: 'sm' | 'md';
}

const SIZE_CLASS = { sm: 'w-1.5 h-1.5', md: 'w-2 h-2' };

export function LoadingDots({ color = '#3B82F6', size = 'md' }: Props) {
  return (
    <div className="flex gap-1.5">
      {[0, 200, 400].map(delay => (
        <div
          key={delay}
          className={`${SIZE_CLASS[size]} rounded-full animate-dot-fade`}
          style={{ background: color, animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
