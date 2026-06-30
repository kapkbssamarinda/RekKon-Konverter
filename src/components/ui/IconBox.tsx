import type { ReactNode } from 'react';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const DIMS: Record<Size, string> = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
};

const RADIUS_DEFAULT: Record<Size, string> = {
  xs: 'rounded-lg',
  sm: 'rounded-lg',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-xl',
};

interface Props {
  size?: Size;
  rounded?: string;
  bg: string;
  border?: string;
  className?: string;
  children: ReactNode;
}

export function IconBox({ size = 'md', rounded, bg, border, className = '', children }: Props) {
  const dims = DIMS[size];
  const radius = rounded ?? RADIUS_DEFAULT[size];
  return (
    <div
      className={`${dims} ${radius} flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ background: bg, ...(border ? { border } : {}) }}
    >
      {children}
    </div>
  );
}
