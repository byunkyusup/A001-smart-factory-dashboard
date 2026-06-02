import type {
  DefectCategory,
  EnergyState,
  FactoryState,
  ProductionLine,
  ProductionSlot,
  Sensor,
} from './types';
import { clamp, drift } from './format';

const computeOee = (l: Pick<ProductionLine, 'availability' | 'performance' | 'quality'>) =>
  l.availability * l.performance * l.quality;

const SHIFT_START_HOUR = 6;
const HOURS = 12;

const buildLines = (): ProductionLine[] => {
  const seed: Array<[string, string, ProductionLine['state'], number, number, number, number]> = [
    ['L1', 'A-셀 조립', 'running', 0.94, 0.97, 0.992, 5200],
    ['L2', 'B-셀 조립', 'running', 0.91, 0.93, 0.985, 4800],
    ['L3', '모듈 패킹', 'running', 0.88, 0.9, 0.978, 6100],
    ['L4', '도장 라인', 'idle', 0.7, 0.82, 0.97, 3900],
    ['L5', '검사·출하', 'maintenance', 0.4, 0.6, 0.95, 2600],
    ['L6', '프레스 #2', 'down', 0.0, 0.0, 0.94, 4400],
  ];
  return seed.map(([id, name, state, a, p, q, target]) => {
    const availability = state === 'down' ? 0 : a;
    const performance = state === 'down' || state === 'idle' ? (state === 'idle' ? 0 : 0) : p;
    const quality = q;
    const oee = computeOee({ availability, performance: state === 'running' ? performance : 0, quality });
    const ratio = state === 'running' ? clamp(0.45 + Math.random() * 0.35, 0, 1) : state === 'idle' ? 0.4 : state === 'maintenance' ? 0.22 : 0.66;
    return {
      id,
      name,
      product: id === 'L4' ? 'EV-700' : 'EV-500',
      state,
      availability,
      performance: state === 'running' ? performance : 0,
      quality,
      oee,
      outputToday: Math.round(target * ratio),
      targetToday: target,
      rate: state === 'running' ? 18 + Math.random() * 10 : 0,
    };
  });
};

const buildSensors = (): Sensor[] => {
  const base: Array<[string, string, string, Sensor['kind'], string, number, number, number, number, number]> = [
    ['S1', '주축 베어링 온도', 'L1', 'temperature', '°C', 30, 95, 72, 85, 58],
    ['S2', '유압 라인 압력', 'L1', 'pressure', 'bar', 0, 12, 9.5, 11, 7.4],
    ['S3', '스핀들 진동', 'L3', 'vibration', 'mm/s', 0, 10, 6, 8, 3.2],
    ['S4', '냉각수 유량', 'L3', 'flow', 'L/min', 0, 60, 50, 55, 38],
    ['S5', '도장부스 온도', 'L4', 'temperature', '°C', 18, 40, 32, 36, 27],
    ['S6', '프레스 진동', 'L6', 'vibration', 'mm/s', 0, 12, 7, 9, 8.6],
  ];
  return base.map(([id, name, line, kind, unit, min, max, warnHigh, critHigh, value]) => ({
    id,
    name,
    line,
    kind,
    unit,
    min,
    max,
    warnHigh,
    critHigh,
    value,
    history: Array.from({ length: 40 }, (_, i) =>
      clamp(value + Math.sin(i / 4) * (max - min) * 0.04 + (Math.random() - 0.5) * (max - min) * 0.05, min, max),
    ),
  }));
};

const buildProduction = (): ProductionSlot[] =>
  Array.from({ length: HOURS }, (_, i) => {
    const hour = String((SHIFT_START_HOUR + i) % 24).padStart(2, '0');
    const target = 1900 + Math.round(Math.sin(i / 2) * 180);
    const past = i < 8;
    const actual = past ? Math.round(target * (0.86 + Math.random() * 0.2)) : 0;
    return { hour, actual, target };
  });

const buildDefects = (): DefectCategory[] => [
  { label: '치수 불량', count: 23, tone: 'crit' },
  { label: '표면 스크래치', count: 17, tone: 'warn' },
  { label: '용접 결함', count: 11, tone: 'warn' },
  { label: '오염', count: 6, tone: 'info' },
  { label: '라벨 오류', count: 4, tone: 'info' },
];

const buildEnergy = (): EnergyState => ({
  powerKw: 1840,
  energyTodayKwh: 12940,
  powerHistory: Array.from({ length: 48 }, (_, i) =>
    1700 + Math.sin(i / 6) * 220 + (Math.random() - 0.5) * 120,
  ),
  powerFactor: 0.94,
  co2Today: 5760,
});

export const initialFactoryState = (): FactoryState => ({
  lines: buildLines(),
  sensors: buildSensors(),
  production: buildProduction(),
  defects: buildDefects(),
  energy: buildEnergy(),
  uptimeSec: 6 * 3600 + 1420,
  tick: 0,
});

/** Advance the simulation by one tick (~1.5s of wall time). Pure: returns new state. */
export const stepFactoryState = (prev: FactoryState): FactoryState => {
  const r = Math.random;

  const lines = prev.lines.map((l) => {
    if (l.state === 'down' || l.state === 'maintenance') return l;
    const availability = drift(l.availability, 0.004, 0.6, 0.99, r);
    const performance = drift(l.performance, 0.01, 0.55, 0.99, r);
    const quality = drift(l.quality, 0.001, 0.95, 0.999, r);
    const rate = drift(l.rate, 0.6, 12, 32, r);
    const oee = availability * performance * quality;
    const outputToday = l.outputToday + (l.state === 'running' ? Math.round(rate / 8) : 0);
    return { ...l, availability, performance, quality, oee, rate, outputToday };
  });

  const sensors = prev.sensors.map((s) => {
    const stepSize = (s.max - s.min) * 0.018;
    const value = drift(s.value, stepSize, s.min, s.max, r);
    const history = [...s.history.slice(1), value];
    return { ...s, value, history };
  });

  const tick = prev.tick + 1;
  const production = prev.production.map((slot, i) => {
    // fill the "current" hour slot progressively (slot index 8)
    if (i === 8 && slot.actual < slot.target * 1.05) {
      return { ...slot, actual: slot.actual + Math.round(8 + r() * 14) };
    }
    return slot;
  });

  const drift1 = (v: number, step: number, lo: number, hi: number) => drift(v, step, lo, hi, r);
  const powerKw = drift1(prev.energy.powerKw, 14, 1500, 2200);
  const energy: EnergyState = {
    powerKw,
    energyTodayKwh: prev.energy.energyTodayKwh + powerKw / 2400,
    powerHistory: [...prev.energy.powerHistory.slice(1), powerKw],
    powerFactor: drift1(prev.energy.powerFactor, 0.003, 0.88, 0.99),
    co2Today: prev.energy.co2Today + powerKw / 5400,
  };

  return {
    lines,
    sensors,
    production,
    defects: prev.defects,
    energy,
    uptimeSec: prev.uptimeSec + 1.5,
    tick,
  };
};
