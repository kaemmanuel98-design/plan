import type { Goal, PillarId } from '../types';

export interface EvolutionPoint {
  label: string;
  monthKey: string;
  value: number;
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getPillarEvolution(
  goals: Goal[],
  pillarId: PillarId,
  monthCount = 6
): EvolutionPoint[] {
  const trackable = goals.filter(
    (g) => g.pillarId === pillarId && g.level !== 'global_vision'
  );

  const now = new Date();
  const points: EvolutionPoint[] = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const cutoff = endOfMonth(monthDate);

    const value =
      trackable.length === 0
        ? 0
        : Math.round(
            (trackable.filter(
              (g) => g.completed && new Date(g.updatedAt) <= cutoff
            ).length /
              trackable.length) *
              100
          );

    points.push({
      label: monthLabel(monthDate),
      monthKey: monthKey(monthDate),
      value,
    });
  }

  return points;
}

export function getPillarCurrentProgress(goals: Goal[], pillarId: PillarId): number {
  const trackable = goals.filter(
    (g) => g.pillarId === pillarId && g.level !== 'global_vision'
  );
  if (trackable.length === 0) return 0;
  return Math.round(
    (trackable.filter((g) => g.completed).length / trackable.length) * 100
  );
}
