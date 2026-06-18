import type { Goal } from '../types';
import { getDescendants } from './progress';
import { getHorizonPosition, isTacticalLevel } from './retroPlanning';
import { isDuringShabbat } from './sabbath';
import { getScheduleInsights } from './scheduleHealth';

export { formatCountdown, getVisionEndDate } from './retroPlanning';

export function getCurrentMonthlyPeriodLabel(startDate: Date, now = new Date()): string {
  const pos = getHorizonPosition(startDate, now);
  const label = new Date(startDate);
  label.setMonth(label.getMonth() + pos.monthsFromStart);
  const formatted = label.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function findCurrentMonthlyGoal(visionId: string, goals: Goal[], now = new Date()): Goal | undefined {
  const vision = goals.find((g) => g.id === visionId);
  if (!vision) return undefined;
  const label = getCurrentMonthlyPeriodLabel(new Date(vision.createdAt), now);
  return getDescendants(goals, visionId).find((g) => g.level === 'monthly' && g.periodLabel === label);
}

export function hasMissedTacticalTasks(goals: Goal[], visionId: string): boolean {
  if (isDuringShabbat()) return false;
  const tactical = getDescendants(goals, visionId).filter((g) => isTacticalLevel(g.level));
  const incompleteDailies = tactical.filter((g) => g.level === 'daily' && !g.completed);
  return incompleteDailies.length >= 3;
}

export function shouldShowRecalculate(
  goals: Goal[],
  visionId: string,
  manuallyBehind: boolean
): boolean {
  if (manuallyBehind) return true;
  const insights = getScheduleInsights(goals);
  if (insights.some((i) => i.visionId === visionId && i.behind)) return true;
  return hasMissedTacticalTasks(goals, visionId);
}
