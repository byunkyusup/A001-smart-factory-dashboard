import { useEffect, useRef, useState } from 'react';
import { initialFactoryState, stepFactoryState } from '../lib/mockData';
import type { FactoryState } from '../lib/types';

const TICK_MS = 1500;

/**
 * Drives the live factory simulation. Returns the current state plus a
 * `paused` flag and a toggle. Uses setInterval but pauses when the tab is
 * hidden so background tabs don't churn.
 */
export function useFactorySimulation() {
  const [state, setState] = useState<FactoryState>(initialFactoryState);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      setState((prev) => stepFactoryState(prev));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return { state, paused, togglePaused: () => setPaused((p) => !p) };
}
