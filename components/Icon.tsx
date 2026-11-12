import type { CSSProperties } from "react";

export function Icon({ id, className = "i", style }: { id: string; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2 28 6.5v8.6c0 6.6-4.6 11.7-12 15C8.6 26.8 4 21.7 4 15.1V6.5L16 2Z" fill="#ff5a1f" />
      <path d="m10.5 16 4 4 7.2-7.6" stroke="#0d0d0f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Mark({ gradient, letter, className = "mk", style }: { gradient: string; letter: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={{ background: gradient, ...style }}>
      {letter}
    </div>
  );
}
