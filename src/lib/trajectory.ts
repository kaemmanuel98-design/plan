import type { Goal } from '../types';
import { getChildren, getDescendants } from './progress';
import { getHorizonPosition, isTacticalLevel } from './retroPlanning';
import { getCascadePaths } from './cascadePaths';
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

function normalizePeriodLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parcourt l'arbre annuel → mensuel dans l'ordre de la cascade. */
export function listMonthlyGoalsInOrder(goals: Goal[], visionId: string): Goal[] {
  const monthlies: Goal[] = [];
  const annuals = getChildren(goals, visionId)
    .filter((g) => g.level === 'annual')
    .sort((a, b) => (a.periodLabel ?? '').localeCompare(b.periodLabel ?? ''));

  for (const annual of annuals) {
    const semesters = getChildren(goals, annual.id)
      .filter((g) => g.level === 'semester')
      .sort((a, b) => (a.periodLabel ?? '').localeCompare(b.periodLabel ?? ''));
    for (const semester of semesters) {
      const quarters = getChildren(goals, semester.id)
        .filter((g) => g.level === 'quarterly')
        .sort((a, b) => (a.periodLabel ?? '').localeCompare(b.periodLabel ?? ''));
      for (const quarter of quarters) {
        const months = getChildren(goals, quarter.id)
          .filter((g) => g.level === 'monthly')
          .sort((a, b) => (a.periodLabel ?? '').localeCompare(b.periodLabel ?? ''));
        monthlies.push(...months);
      }
    }
  }

  return monthlies;
}

/** Trouve l'objectif mensuel du mois calendaire en cours. */
export function findCurrentMonthlyGoal(visionId: string, goals: Goal[], now = new Date()): Goal | undefined {
  const vision = goals.find((g) => g.id === visionId);
  if (!vision) return undefined;

  const startDate = new Date(vision.createdAt);
  const pos = getHorizonPosition(startDate, now);
  const expectedLabel = getCurrentMonthlyPeriodLabel(startDate, now);
  const expectedNorm = normalizePeriodLabel(expectedLabel);
  const monthlies = listMonthlyGoalsInOrder(goals, visionId);

  if (monthlies.length === 0) {
    return getDescendants(goals, visionId).find((g) => g.level === 'monthly');
  }

  const exact = monthlies.find((g) => g.periodLabel === expectedLabel);
  if (exact) return exact;

  const normalized = monthlies.find(
    (g) => g.periodLabel && normalizePeriodLabel(g.periodLabel) === expectedNorm
  );
  if (normalized) return normalized;

  const monthWord = expectedLabel.split(' ')[0]?.toLowerCase();
  if (monthWord) {
    const partial = monthlies.find((g) => g.periodLabel?.toLowerCase().includes(monthWord));
    if (partial) return partial;
  }

  if (pos.monthsFromStart < monthlies.length) {
    return monthlies[pos.monthsFromStart];
  }

  return monthlies[monthlies.length - 1];
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

export interface RecalculateResult {
  ok: boolean;
  message: string;
  added: number;
  removed: number;
}

export function countTacticalGoals(goals: Goal[], visionId: string): number {
  return getDescendants(goals, visionId).filter((g) => isTacticalLevel(g.level)).length;
}

export function getCurrentMonthTacticalPathCount(startDate: Date, now = new Date()): number {
  const pos = getHorizonPosition(startDate, now);
  return getCascadePaths(startDate, now).filter(
    (p) => isTacticalLevel(p.level) && p.path.startsWith(`${pos.monthPath}.`)
  ).length;
}
