import type { ReactNode } from 'react';

export function KpiCard({
  label,
  value,
  note,
  icon,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  note: string;
  icon: ReactNode;
  tone?: 'neutral' | 'red' | 'amber' | 'green';
}) {
  return (
    <article className={`kpi-card tone-${tone}`}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-note">{note}</div>
    </article>
  );
}
