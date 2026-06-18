import type { Goal, PillarId } from '../types';
import { calculateProgress, getChildren } from './progress';

export interface FinanceGaugeItem {
  id: string;
  title: string;
  level: string;
  progress: number;
}

export function getFinanceGauges(goals: Goal[], pillarId: PillarId = 'financier'): FinanceGaugeItem[] {
  const visions = goals.filter((g) => g.pillarId === pillarId && g.level === 'global_vision');
  const items: FinanceGaugeItem[] = [];
  const tracked = new Set<string>();

  for (const vision of visions) {
    const children = getChildren(goals, vision.id);
    for (const child of children) {
      items.push({
        id: child.id,
        title: child.title,
        level: child.periodLabel ?? child.level,
        progress: calculateProgress(goals, child.id) || (child.completed ? 100 : 0),
      });
      tracked.add(child.id);
    }

    if (children.length === 0) {
      items.push({
        id: vision.id,
        title: vision.title,
        level: 'Vision',
        progress: calculateProgress(goals, vision.id),
      });
      tracked.add(vision.id);
    }
  }

  for (const g of goals) {
    if (g.pillarId !== pillarId || g.level === 'global_vision' || tracked.has(g.id)) continue;
    items.push({
      id: g.id,
      title: g.title,
      level: g.periodLabel ?? g.level,
      progress: calculateProgress(goals, g.id) || (g.completed ? 100 : 0),
    });
    tracked.add(g.id);
  }

  return items.slice(0, 5);
}

export function getFinanceGlobalProgress(goals: Goal[], pillarId: PillarId = 'financier'): number {
  const trackable = goals.filter(
    (g) => g.pillarId === pillarId && g.level !== 'global_vision'
  );
  if (trackable.length === 0) return 0;
  return Math.round(
    (trackable.filter((g) => g.completed).length / trackable.length) * 100
  );
}
