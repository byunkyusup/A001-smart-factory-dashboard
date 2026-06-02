import { Panel } from '../ui/Panel';
import { SensorMeter } from '../charts/SensorMeter';
import type { Sensor } from '../../lib/types';
import './sensors.css';

const severity = (s: Sensor) => (s.value >= s.critHigh ? 2 : s.value >= s.warnHigh ? 1 : 0);

export function SensorPanel({ sensors }: { sensors: Sensor[] }) {
  const crit = sensors.filter((s) => severity(s) === 2).length;
  const warn = sensors.filter((s) => severity(s) === 1).length;
  // Surface the most critical sensors first.
  const ordered = [...sensors].sort((a, b) => severity(b) - severity(a));

  return (
    <Panel
      kicker="실시간 센서"
      title="설비 모니터링"
      accent={crit ? 'crit' : warn ? 'warn' : 'ok'}
      actions={
        <span className="sensor-alerts">
          {crit > 0 && <span className="sensor-alerts__badge sensor-alerts__badge--crit">위험 {crit}</span>}
          {warn > 0 && <span className="sensor-alerts__badge sensor-alerts__badge--warn">경고 {warn}</span>}
          {!crit && !warn && <span className="sensor-alerts__badge sensor-alerts__badge--ok">정상</span>}
        </span>
      }
    >
      <div className="sensors">
        {ordered.map((s) => (
          <SensorMeter key={s.id} sensor={s} />
        ))}
      </div>
    </Panel>
  );
}
