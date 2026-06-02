export const pct = (v: number, digits = 1): string =>
  `${(v * 100).toFixed(digits)}%`;

export const num = (v: number, digits = 0): string =>
  v.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

/** Bounded random walk: nudge `v` by ±step, reflect inside [lo, hi]. */
export const drift = (
  v: number,
  step: number,
  lo: number,
  hi: number,
  rand: () => number,
): number => {
  const next = v + (rand() - 0.5) * 2 * step;
  return clamp(next, lo, hi);
};

export const formatClock = (totalSec: number): string => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};
