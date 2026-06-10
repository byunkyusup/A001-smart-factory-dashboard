/**
 * Open-Meteo 현재 기상 연동 (실데이터).
 * - API 키 불필요, CORS 허용 → 브라우저에서 직접 호출 가능
 * - 공장 부지의 외기 환경(기온·습도·기압·풍속)을 실측으로 표시
 * 출처: https://open-meteo.com (CC BY 4.0)
 */

/** 공장 부지 좌표 — 울산(국내 대표 중공업 단지). 다른 부지면 좌표만 교체. */
export const SITE_LOCATION = {
  name: '울산 · 공장 부지',
  latitude: 35.546,
  longitude: 129.317,
} as const;

export interface SiteEnvironment {
  /** 외기 온도 (°C) */
  temperatureC: number;
  /** 상대 습도 (%) */
  humidity: number;
  /** 지면 기압 (hPa) */
  pressureHpa: number;
  /** 풍속 (m/s) */
  windMs: number;
  /** 순간 돌풍 (m/s) */
  gustMs: number;
  /** WMO 기상 코드 */
  weatherCode: number;
  /** 주간 여부 */
  isDay: boolean;
  /** 관측 시각 (관측소 로컬 ISO 문자열) */
  observedAt: string;
}

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

const buildUrl = (): string => {
  const params = new URLSearchParams({
    latitude: String(SITE_LOCATION.latitude),
    longitude: String(SITE_LOCATION.longitude),
    current:
      'temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_gusts_10m,weather_code,is_day',
    wind_speed_unit: 'ms',
    timezone: 'Asia/Seoul',
  });
  return `${ENDPOINT}?${params.toString()}`;
};

/** 외부 응답은 신뢰하지 않는다 — 필요한 숫자 필드를 명시적으로 검증한다. */
const asNumber = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Open-Meteo 응답의 '${field}' 필드가 유효한 숫자가 아닙니다.`);
  }
  return value;
};

interface OpenMeteoResponse {
  current?: Record<string, unknown>;
}

/**
 * 현재 기상 1건을 가져온다. 네트워크/검증 실패 시 throw.
 * @param signal AbortController 신호 (언마운트 시 취소)
 */
export async function fetchSiteEnvironment(signal?: AbortSignal): Promise<SiteEnvironment> {
  const res = await fetch(buildUrl(), { signal, headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Open-Meteo 요청 실패: HTTP ${res.status}`);
  }

  const body = (await res.json()) as OpenMeteoResponse;
  const c = body.current;
  if (!c || typeof c !== 'object') {
    throw new Error('Open-Meteo 응답에 current 데이터가 없습니다.');
  }

  return {
    temperatureC: asNumber(c.temperature_2m, 'temperature_2m'),
    humidity: asNumber(c.relative_humidity_2m, 'relative_humidity_2m'),
    pressureHpa: asNumber(c.surface_pressure, 'surface_pressure'),
    windMs: asNumber(c.wind_speed_10m, 'wind_speed_10m'),
    gustMs: asNumber(c.wind_gusts_10m, 'wind_gusts_10m'),
    weatherCode: asNumber(c.weather_code, 'weather_code'),
    isDay: asNumber(c.is_day, 'is_day') === 1,
    observedAt: typeof c.time === 'string' ? c.time : '',
  };
}

/** WMO weather code → 한국어 요약. (대표 코드만 매핑, 그 외는 '기타') */
export const describeWeather = (code: number): string => {
  if (code === 0) return '맑음';
  if (code <= 3) return '구름';
  if (code === 45 || code === 48) return '안개';
  if (code >= 51 && code <= 57) return '이슬비';
  if (code >= 61 && code <= 67) return '비';
  if (code >= 71 && code <= 77) return '눈';
  if (code >= 80 && code <= 82) return '소나기';
  if (code >= 95) return '뇌우';
  return '기타';
};
