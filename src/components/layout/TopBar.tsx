import { formatClock, num, pct } from '../../lib/format';
import type { FactoryState } from '../../lib/types';
import './shell.css';

interface TopBarProps {
  state: FactoryState;
  oee: number;
  paused: boolean;
  onTogglePaused: () => void;
}

export function TopBar({ state, oee, paused, onTogglePaused }: TopBarProps) {
  const running = state.lines.filter((l) => l.state === 'running').length;
  const alerts = state.sensors.filter((s) => s.value >= s.warnHigh).length;
  const crit = state.sensors.filter((s) => s.value >= s.critHigh).length;

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <div className="topbar__logo" aria-hidden="true">
          <span />
        </div>
        <div className="topbar__brand-text">
          <span className="topbar__brand-name">SMF<i>·</i>CONTROL</span>
          <span className="label">스마트팩토리 통합 관제 · 1공장</span>
        </div>
      </div>

      <div className="topbar__kpis">
        <Kpi label="종합 OEE" value={pct(oee, 1)} tone={oee >= 0.85 ? 'ok' : oee >= 0.6 ? 'warn' : 'crit'} />
        <Kpi label="가동 라인" value={`${running}/${state.lines.length}`} />
        <Kpi label="수전 전력" value={`${num(state.energy.powerKw)} kW`} />
        <Kpi
          label="활성 알람"
          value={String(alerts)}
          tone={crit ? 'crit' : alerts ? 'warn' : 'ok'}
        />
      </div>

      <div className="topbar__right">
        <div className="topbar__clock">
          <span className="label">교대조 누적</span>
          <span className="topbar__clock-val mono">{formatClock(state.uptimeSec)}</span>
        </div>
        <button
          className={`ghost-btn topbar__live${paused ? ' is-paused' : ''}`}
          onClick={onTogglePaused}
          aria-pressed={!paused}
        >
          <span className="topbar__live-dot" aria-hidden="true" />
          {paused ? '일시정지' : 'LIVE'}
        </button>
      </div>
    </header>
  );
}

function Kpi({ label, value, tone = 'default' }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`topbar__kpi topbar__kpi--${tone}`}>
      <span className="label">{label}</span>
      <span className="topbar__kpi-val mono">{value}</span>
    </div>
  );
}
