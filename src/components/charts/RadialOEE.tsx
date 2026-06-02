interface RadialOEEProps {
  value: number; // 0..1
  size?: number;
  label?: string;
}

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
};

const arcPath = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
  const [sx, sy] = polar(cx, cy, r, endDeg);
  const [ex, ey] = polar(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 0 ${ex} ${ey}`;
};

/** 270° radial gauge for OEE-style 0..1 metrics. */
export function RadialOEE({ value, size = 168, label = 'OEE' }: RadialOEEProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const START = -135;
  const END = 135;
  const sweep = END - START;
  const valueDeg = START + sweep * value;

  const tone = value >= 0.85 ? 'var(--ok)' : value >= 0.6 ? 'var(--warn)' : 'var(--crit)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} ${(value * 100).toFixed(1)}%`}>
      <path d={arcPath(cx, cy, r, START, END)} fill="none" stroke="var(--hairline-strong)" strokeWidth="11" strokeLinecap="round" />
      <path
        d={arcPath(cx, cy, r, START, valueDeg)}
        fill="none"
        stroke={tone}
        strokeWidth="11"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${tone})`, transition: 'all 600ms cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" className="mono" fontSize={size * 0.24} fontWeight="600" fill="var(--text-hi)">
        {(value * 100).toFixed(0)}
      </text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle" fontSize="11" letterSpacing="0.18em" fill="var(--text-faint)">
        {label}
      </text>
    </svg>
  );
}
