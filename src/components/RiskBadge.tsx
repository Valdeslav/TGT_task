import type { RiskLevel } from '../types';
import { riskLevelLabel } from '../lib/risk';

export function RiskBadge({
  level,
  score,
  compact = false,
}: {
  level: RiskLevel;
  score?: number;
  compact?: boolean;
}) {
  const label = riskLevelLabel(level);
  return (
    <span className={`risk-badge ${level}`} title={label}>
      <span className="risk-dot" />
      {score !== undefined ? (
        <>
          <b>{score}</b>
          {!compact && <span>· {label.toLowerCase()}</span>}
        </>
      ) : (
        label
      )}
    </span>
  );
}
