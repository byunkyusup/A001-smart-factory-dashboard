import { useFactorySimulation } from './hooks/useFactorySimulation';
import { TopBar } from './components/layout/TopBar';
import { OeePanel } from './components/oee/OeePanel';
import { ProductionPanel } from './components/production/ProductionPanel';
import { SensorPanel } from './components/sensors/SensorPanel';
import { EnergyQualityPanel } from './components/energy/EnergyQualityPanel';
import { SiteEnvironmentPanel } from './components/environment/SiteEnvironmentPanel';
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
        <div className="grid__wide">
          <SiteEnvironmentPanel />
        </div>
      </main>

      <footer className="footer-note">
        설비 KPI·센서·생산 데이터는 시뮬레이션 ({state.tick} ticks · 1.5초 주기, 실제 PLC/SCADA 연동 시 소스만 교체) ·
        부지 외기는 Open-Meteo 실측 데이터
      </footer>
    </div>
  );
}
