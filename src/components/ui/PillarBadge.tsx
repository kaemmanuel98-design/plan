import { getPillar } from '../../data/pillars';
import type { PillarId } from '../../types';

interface PillarBadgeProps {
  pillarId: PillarId;
  size?: 'sm' | 'md';
}

export function PillarBadge({ pillarId, size = 'sm' }: PillarBadgeProps) {
  const pillar = getPillar(pillarId);

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]'
      }`}
      style={{
        color: pillar.color,
        backgroundColor: `${pillar.color}12`,
      }}
    >
      {pillar.label}
    </span>
  );
}
