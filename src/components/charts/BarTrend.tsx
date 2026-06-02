import './charts.css';
import type { ProductionSlot } from '../../lib/types';

interface BarTrendProps {
  slots: ProductionSlot[];
  currentIndex: number;
}

/** Hourly actual-vs-target bars with a target reference line per bar. */
export function BarTrend({ slots, currentIndex }: BarTrendProps) {
  const maxVal = Math.max(...slots.map((s) => Math.max(s.actual, s.target))) * 1.08;

  return (
    <div className="bartrend" role="img" aria-label="시간대별 생산 실적 대비 목표">
      {slots.map((s, i) => {
        const actualH = (s.actual / maxVal) * 100;
        const targetH = (s.target / maxVal) * 100;
        const hit = s.actual >= s.target;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;
        const tone = isFuture ? 'future' : hit ? 'hit' : 'miss';
        return (
          <div className="bartrend__col" key={s.hour}>
            <div className="bartrend__track">
              <span className="bartrend__target" style={{ bottom: `${targetH}%` }} />
              <span
                className={`bartrend__bar bartrend__bar--${tone}${isCurrent ? ' is-current' : ''}`}
                style={{ height: `${isFuture ? 0 : actualH}%` }}
              />
            </div>
            <span className={`bartrend__hour${isCurrent ? ' is-current' : ''}`}>{s.hour}</span>
          </div>
        );
      })}
    </div>
  );
}
