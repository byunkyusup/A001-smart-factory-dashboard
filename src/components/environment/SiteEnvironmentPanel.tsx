import { Panel } from '../ui/Panel';
import { useSiteEnvironment, type EnvStatus } from '../../hooks/useSiteEnvironment';
import { SITE_LOCATION, describeWeather } from '../../lib/openMeteo';
import { num } from '../../lib/format';
import './environment.css';

const STATUS_LABEL: Record<EnvStatus, string> = {
  loading: '연결 중',
  live: 'LIVE',
  error: '지연',
};

const formatUpdated = (ts: number | null): string => {
  if (!ts) return '—';
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export function SiteEnvironmentPanel() {
  const { data, status, lastUpdated, error } = useSiteEnvironment();

  return (
    <Panel
      kicker="부지 환경 · 실측"
      title="공장 외기 모니터링"
      accent="ok"
      actions={
        <span className={`env__badge env__badge--${status}`} title={error ?? undefined}>
          <span className="env__badge-dot" />
          {STATUS_LABEL[status]}
        </span>
      }
    >
      <div className="env">
        <div className="env__meta">
          <span className="env__loc">📍 {SITE_LOCATION.name}</span>
          <span className="env__source">
            출처 ·{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">
              Open-Meteo
            </a>{' '}
            · 갱신 {formatUpdated(lastUpdated)}
          </span>
        </div>

        {data ? (
          <>
            <div className="env__hero">
              <div className="env__temp mono">
                {num(data.temperatureC, 1)}
                <span className="env__temp-unit">°C</span>
              </div>
              <div className="env__cond">
                <span className="env__cond-main">{describeWeather(data.weatherCode)}</span>
                <span className="env__cond-sub">{data.isDay ? '주간' : '야간'} · 외기 온도</span>
              </div>
            </div>

            <div className="env__grid">
              <Metric label="습도" value={num(data.humidity, 0)} unit="%" />
              <Metric label="기압" value={num(data.pressureHpa, 0)} unit="hPa" />
              <Metric label="풍속" value={num(data.windMs, 1)} unit="m/s" />
              <Metric label="돌풍" value={num(data.gustMs, 1)} unit="m/s" />
            </div>
          </>
        ) : status === 'error' ? (
          <p className="env__fallback env__fallback--error">
            실측 데이터를 불러오지 못했습니다. 다음 주기에 재시도합니다.
          </p>
        ) : (
          <p className="env__fallback">실측 기상 데이터를 불러오는 중…</p>
        )}
      </div>
    </Panel>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="env__metric">
      <span className="label">{label}</span>
      <span className="env__metric-val mono">
        {value}
        <span className="env__metric-unit">{unit}</span>
      </span>
    </div>
  );
}
