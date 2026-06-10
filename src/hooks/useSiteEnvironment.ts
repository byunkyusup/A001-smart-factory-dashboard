import { useEffect, useState } from 'react';
import { fetchSiteEnvironment, type SiteEnvironment } from '../lib/openMeteo';

/** 기상은 천천히 변하므로 60초 주기로 폴링 (API 부하 최소화). */
const POLL_MS = 60_000;

export type EnvStatus = 'loading' | 'live' | 'error';

export interface SiteEnvironmentResult {
  data: SiteEnvironment | null;
  status: EnvStatus;
  /** 마지막 성공 갱신 시각 (epoch ms). 미수신이면 null. */
  lastUpdated: number | null;
  error: string | null;
}

/**
 * Open-Meteo 실측 기상을 마운트 시 1회 + 60초 주기로 가져온다.
 * - 탭이 숨겨지면 폴링을 건너뛴다.
 * - 오류가 나도 마지막 성공 데이터는 유지하고 status만 'error'로 표시.
 */
export function useSiteEnvironment(): SiteEnvironmentResult {
  const [data, setData] = useState<SiteEnvironment | null>(null);
  const [status, setStatus] = useState<EnvStatus>('loading');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      if (document.hidden) return;
      try {
        const next = await fetchSiteEnvironment(controller.signal);
        if (cancelled) return;
        setData(next);
        setLastUpdated(Date.now());
        setError(null);
        setStatus('live');
      } catch (err: unknown) {
        if (cancelled || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : '기상 데이터를 가져오지 못했습니다.');
        // 이전 성공 데이터가 있으면 유지, status만 'error'로 표시
        setStatus('error');
      }
    };

    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(id);
    };
  }, []);

  return { data, status, lastUpdated, error };
}
