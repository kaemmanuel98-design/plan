import type { Goal } from '../types';
import { isDuringShabbat, getShabbatMessage } from './sabbath';
import { getTodayTasks } from './currentFocus';
import { findRootVision } from './progress';

export function getFocusItems(goals: Goal[]) {
  if (isDuringShabbat()) {
    return {
      daily: [] as Goal[],
      timeBlocks: [] as Goal[],
      progress: 0,
      total: 0,
      done: 0,
      shabbat: true as const,
      shabbatMessage: getShabbatMessage(),
    };
  }

  const visionIds = [
    ...new Set(
      goals
        .filter((g) => g.level === 'global_vision')
        .map((g) => g.id)
    ),
  ];

  if (visionIds.length === 0) {
    for (const g of goals) {
      if (g.level === 'daily' || g.level === 'time_block') {
        const root = findRootVision(goals, g.id);
        if (root) visionIds.push(root.id);
      }
    }
  }

  const uniqueVisionIds = [...new Set(visionIds)];
  const slice = getTodayTasks(goals, uniqueVisionIds);

  return {
    daily: slice.daily,
    timeBlocks: slice.timeBlocks,
    progress: slice.progress,
    total: slice.total,
    done: slice.done,
    shabbat: false as const,
  };
}

export function formatFocusDate(date = new Date()): { weekday: string; day: string; month: string } {
  return {
    weekday: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
    day: date.toLocaleDateString('fr-FR', { day: 'numeric' }),
    month: date.toLocaleDateString('fr-FR', { month: 'long' }),
  };
}
