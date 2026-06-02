import { useFactorySimulation } from './hooks/useFactorySimulation';
import { TopBar } from './components/layout/TopBar';
import { OeePanel } from './components/oee/OeePanel';
import { ProductionPanel } from './components/production/ProductionPanel';
import { SensorPanel } from './components/sensors/SensorPanel';
import { EnergyQualityPanel } from './components/energy/EnergyQualityPanel';
import type { ProductionLine } from './lib/types';
import './components/layout/shell.css';

const aggregateOee = (lines: ProductionLine[]) => {
  const active = lines.filter((l) => l.state === 'running');
  return active.length ? active.reduce((s, l) => s + l.oee, 0) / active.length : 0;
};

const aggregateYield = (lines: ProductionLine[]) => {
  const active = lines.filter((l) => l.state === 'running');
  return active.length ? active.reduce((s, l) => s + l.quality, 0) / active.length : 0;
};

export default function App() {
  const { state, paused, togglePaused } = useFactorySimulation();
  const oee = aggregateOee(state.lines);

  return (
    <div className="shell">
      <TopBar state={state} oee={oee} paused={paused} onTogglePaused={togglePaused} />

      <main className="grid" aria-label="공장 관제 대시보드">
        <OeePanel lines={state.lines} />
        <SensorPanel sensors={state.sensors} />
        <div className="grid__wide">
          <ProductionPanel slots={state.production} lines={state.lines} />
        </div>
        <div className="grid__wide">
          <EnergyQualityPanel
            energy={state.energy}
            defects={state.defects}
            yieldRate={aggregateYield(state.lines)}
          />
        </div>
      </main>

      <footer className="footer-note">
        시뮬레이션 데이터 · {state.tick} ticks · 1.5초 주기 갱신 · 실제 PLC/SCADA 연동 시 데이터 소스만 교체
      </footer>
    </div>
  );
}
