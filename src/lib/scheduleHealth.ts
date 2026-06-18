import type { Goal } from '../types';
import { calculateProgress } from './progress';

export interface ScheduleInsight {
  visionId: string;
  visionTitle: string;
  actualProgress: number;
  expectedProgress: number;
  gap: number;
  behind: boolean;
}

const HORIZON_MONTHS = 24;

export function getScheduleInsights(goals: Goal[]): ScheduleInsight[] {
  const visions = goals.filter((g) => g.level === 'global_vision');
  const now = Date.now();

  return visions.map((vision) => {
    const start = new Date(vision.createdAt).getTime();
    const elapsedMonths = Math.max(0, (now - start) / (1000 * 60 * 60 * 24 * 30.44));
    const expectedProgress = Math.min(
      100,
      Math.round((elapsedMonths / HORIZON_MONTHS) * 100)
    );
    const actualProgress = calculateProgress(goals, vision.id);
    const gap = expectedProgress - actualProgress;

    return {
      visionId: vision.id,
      visionTitle: vision.title,
      actualProgress,
      expectedProgress,
      gap,
      behind: gap > 8,
    };
  });
}

export function hasScheduleDelay(goals: Goal[]): boolean {
  return getScheduleInsights(goals).some((i) => i.behind);
}
