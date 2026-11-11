import type { RiskLevel } from '../types';

const palettes = [
  ['#e7f0d8', '#3f5a2a'],
  ['#f6e6d8', '#7a4a2a'],
  ['#e1e9f7', '#2f4a7a'],
  ['#f2e1ea', '#6a3350'],
  ['#e6e4f7', '#4a3f7a'],
  ['#f7edc9', '#6a5a1f'],
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
}

export function Avatar({
  name,
  size = 'md',
  risk,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  risk?: RiskLevel;
}) {
  const sum = Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0);
  const [background, color] = palettes[sum % palettes.length];
  return (
    <span
      className={`avatar ${size} ${risk ? `avatar-risk-${risk}` : ''}`}
      style={{ background, color }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
