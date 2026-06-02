import { Panel } from '../ui/Panel';
import { RadialOEE } from '../charts/RadialOEE';
import { StatusDot, stateLabel } from '../ui/StatusDot';
import { pct } from '../../lib/format';
import type { ProductionLine } from '../../lib/types';
import './oee.css';

const aggregateOee = (lines: ProductionLine[]) => {
  const active = lines.filter((l) => l.state === 'running');
  if (active.length === 0) return 0;
  return active.reduce((s, l) => s + l.oee, 0) / active.length;
};

export function OeePanel({ lines }: { lines: ProductionLine[] }) {
  const oee = aggregateOee(lines);
  const running = lines.filter((l) => l.state === 'running').length;
  const down = lines.filter((l) => l.state === 'down').length;

  return (
    <Panel
      kicker="설비 종합효율"
      title="OEE · 가동 현황"
      accent={oee >= 0.85 ? 'ok' : oee >= 0.6 ? 'warn' : 'crit'}
      actions={<span className="label">{running}/{lines.length} 가동 · {down} 정지</span>}
    >
      <div className="oee">
        <div className="oee__gauge">
          <RadialOEE value={oee} />
          <div className="oee__legend">
            <LegendRow tone="ok" label="가동률" value={pct(avg(lines, 'availability'))} />
            <LegendRow tone="cyan" label="성능" value={pct(avg(lines, 'performance'))} />
            <LegendRow tone="info" label="품질" value={pct(avg(lines, 'quality'))} />
          </div>
        </div>
        <ul className="oee__lines">
          {lines.map((l) => (
            <li className="oee__line" key={l.id}>
              <div className="oee__line-id">
                <StatusDot state={l.state} />
                <span className="oee__line-code mono">{l.id}</span>
                <span className="oee__line-name">{l.name}</span>
              </div>
              <div className="oee__bar">
                <span
                  className="oee__bar-fill"
                  style={{
                    width: `${(l.state === 'running' ? l.oee : 0) * 100}%`,
                    background: l.oee >= 0.85 ? 'var(--ok)' : l.oee >= 0.6 ? 'var(--warn)' : 'var(--crit)',
                  }}
                />
              </div>
              <span className="oee__line-val mono">
                {l.state === 'running' ? pct(l.oee, 0) : <em className="oee__line-state">{stateLabel(l.state)}</em>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

const avg = (lines: ProductionLine[], key: 'availability' | 'performance' | 'quality') => {
  const active = lines.filter((l) => l.state === 'running');
  if (!active.length) return 0;
  return active.reduce((s, l) => s + l[key], 0) / active.length;
};

function LegendRow({ tone, label, value }: { tone: string; label: string; value: string }) {
  return (
    <div className="oee__legend-row">
      <span className={`oee__swatch oee__swatch--${tone}`} />
      <span className="oee__legend-label">{label}</span>
      <span className="oee__legend-val mono">{value}</span>
    </div>
  );
}
