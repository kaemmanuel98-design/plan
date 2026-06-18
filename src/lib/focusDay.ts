import type { Goal } from '../types';

export function getFocusItems(goals: Goal[]) {
  const daily = goals.filter((g) => g.level === 'daily');
  const timeBlocks = goals
    .filter((g) => g.level === 'time_block')
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));

  const completedDaily = daily.filter((g) => g.completed).length;
  const completedBlocks = timeBlocks.filter((g) => g.completed).length;
  const total = daily.length + timeBlocks.length;
  const done = completedDaily + completedBlocks;

  return {
    daily,
    timeBlocks,
    progress: total === 0 ? 0 : Math.round((done / total) * 100),
    total,
    done,
  };
}

export function formatFocusDate(date = new Date()): { weekday: string; day: string; month: string } {
  return {
    weekday: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
    day: date.toLocaleDateString('fr-FR', { day: 'numeric' }),
    month: date.toLocaleDateString('fr-FR', { month: 'long' }),
  };
}
