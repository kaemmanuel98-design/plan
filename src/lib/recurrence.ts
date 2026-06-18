import type { Goal, Recurrence } from '../types';

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function periodStart(recurrence: Recurrence, ref: Date): Date | null {
  if (recurrence === 'weekly') return startOfWeek(ref);
  if (recurrence === 'monthly') return startOfMonth(ref);
  return null;
}

export function isRecurring(goal: Goal): boolean {
  return goal.recurrence === 'weekly' || goal.recurrence === 'monthly';
}

export function shouldResetRecurring(goal: Goal, now = new Date()): boolean {
  if (!goal.completed || !isRecurring(goal) || !goal.recurrence) return false;

  const anchor = goal.recurrenceCompletedAt ?? goal.updatedAt;
  const completedAt = new Date(anchor);
  const currentPeriod = periodStart(goal.recurrence, now);
  const completedPeriod = periodStart(goal.recurrence, completedAt);

  if (!currentPeriod || !completedPeriod) return false;
  return currentPeriod.getTime() > completedPeriod.getTime();
}

export function applyRecurrenceResets(goals: Goal[], now = new Date()): Goal[] {
  let changed = false;
  const next = goals.map((goal) => {
    if (!shouldResetRecurring(goal, now)) return goal;
    changed = true;
    return {
      ...goal,
      completed: false,
      updatedAt: now.toISOString(),
    };
  });
  return changed ? next : goals;
}

export function recurrenceLabel(recurrence: Recurrence): string {
  if (recurrence === 'weekly') return 'Chaque semaine';
  if (recurrence === 'monthly') return 'Chaque mois';
  return '';
}

export function recurrenceShort(recurrence: Recurrence): string {
  if (recurrence === 'weekly') return 'sem.';
  if (recurrence === 'monthly') return 'mois';
  return '';
}
