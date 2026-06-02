export type LineState = 'running' | 'idle' | 'down' | 'maintenance';

export interface ProductionLine {
  id: string;
  name: string;
  product: string;
  state: LineState;
  /** Overall Equipment Effectiveness components, 0..1 */
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  outputToday: number;
  targetToday: number;
  /** units produced per minute, recent */
  rate: number;
}

export type SensorKind = 'temperature' | 'pressure' | 'vibration' | 'flow';

export interface Sensor {
  id: string;
  name: string;
  line: string;
  kind: SensorKind;
  unit: string;
  value: number;
  min: number;
  max: number;
  warnHigh: number;
  critHigh: number;
  history: number[];
}

export interface ProductionSlot {
  /** hour label, e.g. "08" */
  hour: string;
  actual: number;
  target: number;
}

export interface DefectCategory {
  label: string;
  count: number;
  tone: 'crit' | 'warn' | 'info';
}

export interface EnergyState {
  /** instantaneous demand, kW */
  powerKw: number;
  /** cumulative today, kWh */
  energyTodayKwh: number;
  /** kW history for the trend strip */
  powerHistory: number[];
  /** power factor 0..1 */
  powerFactor: number;
  /** CO2 kg today */
  co2Today: number;
}

export interface FactoryState {
  lines: ProductionLine[];
  sensors: Sensor[];
  production: ProductionSlot[];
  defects: DefectCategory[];
  energy: EnergyState;
  /** seconds elapsed in the simulated shift */
  uptimeSec: number;
  tick: number;
}
