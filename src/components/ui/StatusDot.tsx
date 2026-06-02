import type { LineState } from '../../lib/types';
import './ui.css';

const META: Record<LineState, { label: string; tone: string }> = {
  running: { label: '가동', tone: 'ok' },
  idle: { label: '대기', tone: 'idle' },
  maintenance: { label: '정비', tone: 'info' },
  down: { label: '정지', tone: 'crit' },
};

export function StatusDot({ state, withLabel = false }: { state: LineState; withLabel?: boolean }) {
  const m = META[state];
  return (
    <span className={`status status--${m.tone}`}>
      <span className="status__dot" aria-hidden="true" />
      {withLabel && <span className="status__label">{m.label}</span>}
    </span>
  );
}

export const stateLabel = (s: LineState) => META[s].label;
