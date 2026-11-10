import { ringColor } from "@/lib/util";

export function Ico({ id, style, className = "i" }: { id: string; style?: React.CSSProperties; className?: string }) {
  return (
    <svg className={className} style={style} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

export function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2 28 6.500v8.600c0 6.600-4.600 11.700-12 15C8.600 26.800 4 21.700 4 15.100V6.500L16 2Z" fill="#ff5a1f" />
      <path d="m10.500 16 4 4 7.200-7.600" stroke="#0d0d0f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Ring({ score, size, stroke }: { score: number; size: number; stroke: number }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, dash = (score / 100) * c, cl = ringColor(score);
  return (
    <>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="trk" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle className="arc" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={cl} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
      </svg>
      <span className="num" style={{ fontSize: Math.round(size * 0.34), color: cl }}>{score}</span>
    </>
  );
}
