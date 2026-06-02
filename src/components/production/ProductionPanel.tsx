import { Panel } from '../ui/Panel';
import { BarTrend } from '../charts/BarTrend';
import { num, pct } from '../../lib/format';
import type { ProductionLine, ProductionSlot } from '../../lib/types';
import './production.css';

const CURRENT_SLOT = 8;

export function ProductionPanel({
  slots,
  lines,
}: {
  slots: ProductionSlot[];
  lines: ProductionLine[];
}) {
  const actualToday = lines.reduce((s, l) => s + l.outputToday, 0);
  const targetToday = lines.reduce((s, l) => s + l.targetToday, 0);
  const achievement = targetToday ? actualToday / targetToday : 0;
  const runningRate = lines.filter((l) => l.state === 'running').reduce((s, l) => s + l.rate, 0);

  return (
    <Panel
      kicker="생산 실적"
      title="시간대별 산출량"
      accent={achievement >= 0.95 ? 'ok' : achievement >= 0.8 ? 'warn' : 'crit'}
      actions={<span className="label">교대조 A · {slots[0].hour}:00–{slots[slots.length - 1].hour}:00</span>}
    >
      <div className="prod">
        <div className="prod__stats">
          <Metric label="누적 생산" value={num(actualToday)} unit="EA" big />
          <Metric label="목표" value={num(targetToday)} unit="EA" />
          <Metric
            label="달성률"
            value={pct(achievement, 1)}
            tone={achievement >= 0.95 ? 'ok' : achievement >= 0.8 ? 'warn' : 'crit'}
          />
          <Metric label="현재 속도" value={num(runningRate, 0)} unit="EA/분" />
        </div>
        <BarTrend slots={slots} currentIndex={CURRENT_SLOT} />
        <div className="prod__axis">
          <span className="label">실적 달성</span>
          <span className="label prod__axis-miss">목표 미달</span>
          <span className="label">목표선 ┄┄</span>
        </div>
      </div>
    </Panel>
  );
}

function Metric({
  label,
  value,
  unit,
  tone = 'default',
  big = false,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: 'default' | 'ok' | 'warn' | 'crit';
  big?: boolean;
}) {
  return (
    <div className={`prod__metric prod__metric--${tone}${big ? ' is-big' : ''}`}>
      <span className="label">{label}</span>
      <span className="prod__metric-val mono">
        {value}
        {unit && <span className="prod__metric-unit">{unit}</span>}
      </span>
    </div>
  );
}
