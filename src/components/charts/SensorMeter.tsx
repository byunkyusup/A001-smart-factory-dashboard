import type { Sensor } from '../../lib/types';
import { Sparkline } from './Sparkline';
import './charts.css';

const toneFor = (s: Sensor): 'ok' | 'warn' | 'crit' => {
  if (s.value >= s.critHigh) return 'crit';
  if (s.value >= s.warnHigh) return 'warn';
  return 'ok';
};

const toneVar: Record<'ok' | 'warn' | 'crit', string> = {
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  crit: 'var(--crit)',
};

/** A single sensor row: name, live value, threshold bar, and sparkline. */
export function SensorMeter({ sensor }: { sensor: Sensor }) {
  const tone = toneFor(sensor);
  const fill = ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
  const warnPos = ((sensor.warnHigh - sensor.min) / (sensor.max - sensor.min)) * 100;
  const critPos = ((sensor.critHigh - sensor.min) / (sensor.max - sensor.min)) * 100;

  return (
    <div className={`sensor sensor--${tone}`}>
      <div className="sensor__top">
        <div className="sensor__id">
          <span className="sensor__name">{sensor.name}</span>
          <span className="sensor__line label">{sensor.line}</span>
        </div>
        <div className="sensor__read mono">
          {sensor.value.toFixed(1)}
          <span className="sensor__unit">{sensor.unit}</span>
        </div>
      </div>
      <div className="sensor__bar">
        <span className="sensor__bar-fill" style={{ width: `${fill}%`, background: toneVar[tone] }} />
        <span className="sensor__mark sensor__mark--warn" style={{ left: `${warnPos}%` }} />
        <span className="sensor__mark sensor__mark--crit" style={{ left: `${critPos}%` }} />
      </div>
      <div className="sensor__spark">
        <Sparkline data={sensor.history} width={240} height={26} stroke={toneVar[tone]} min={sensor.min} max={sensor.max} />
      </div>
    </div>
  );
}
