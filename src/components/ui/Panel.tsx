import type { ReactNode } from 'react';
import './ui.css';

interface PanelProps {
  title: string;
  kicker?: string;
  accent?: 'cyan' | 'ok' | 'warn' | 'crit';
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, kicker, accent = 'cyan', actions, children, className }: PanelProps) {
  return (
    <section className={`panel panel--${accent}${className ? ` ${className}` : ''}`}>
      <header className="panel__head">
        <div className="panel__titles">
          {kicker && <span className="label">{kicker}</span>}
          <h2 className="panel__title">{title}</h2>
        </div>
        {actions && <div className="panel__actions">{actions}</div>}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  );
}
