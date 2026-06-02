import { Panel } from '../ui/Panel';
import { Sparkline } from '../charts/Sparkline';
import { num, pct } from '../../lib/format';
import type { DefectCategory, EnergyState } from '../../lib/types';
import './energy.css';

export function EnergyQualityPanel({
  energy,
  defects,
  yieldRate,
}: {
  energy: EnergyState;
  defects: DefectCategory[];
  yieldRate: number;
}) {
  const totalDefects = defects.reduce((s, d) => s + d.count, 0);
  const maxDefect = Math.max(...defects.map((d) => d.count));

  return (
    <Panel kicker="에너지 · 품질" title="전력 사용 & 불량 분석" accent="cyan">
      <div className="eq">
        <div className="eq__energy">
          <div className="eq__power">
            <span className="label">실시간 수전 전력</span>
            <div className="eq__power-val mono">
              {num(energy.powerKw)}
              <span className="eq__power-unit">kW</span>
            </div>
            <Sparkline data={energy.powerHistory} width={260} height={40} stroke="var(--accent)" />
          </div>
          <div className="eq__energy-grid">
            <Mini label="금일 전력량" value={num(energy.energyTodayKwh)} unit="kWh" />
            <Mini label="역률" value={pct(energy.powerFactor, 0)} tone={energy.powerFactor >= 0.92 ? 'ok' : 'warn'} />
            <Mini label="CO₂ 배출" value={num(energy.co2Today)} unit="kg" />
            <Mini label="수율" value={pct(yieldRate, 1)} tone={yieldRate >= 0.97 ? 'ok' : 'warn'} />
          </div>
        </div>

        <div className="eq__quality">
          <div className="eq__quality-head">
            <span className="label">불량 유형 · 금일</span>
            <span className="eq__defect-total mono">{totalDefects}건</span>
          </div>
          <ul className="eq__defects">
            {defects.map((d) => (
              <li className="eq__defect" key={d.label}>
                <span className="eq__defect-label">{d.label}</span>
                <div className="eq__defect-bar">
                  <span
                    className={`eq__defect-fill eq__defect-fill--${d.tone}`}
                    style={{ width: `${(d.count / maxDefect) * 100}%` }}
                  />
                </div>
                <span className="eq__defect-count mono">{d.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

function Mini({
  label,
  value,
  unit,
  tone = 'default',
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: 'default' | 'ok' | 'warn';
}) {
  return (
    <div className={`eq__mini eq__mini--${tone}`}>
      <span className="label">{label}</span>
      <span className="eq__mini-val mono">
        {value}
        {unit && <span className="eq__mini-unit">{unit}</span>}
      </span>
    </div>
  );
}
