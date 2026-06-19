import type { Goal } from '../types';
import { getChildren, getDescendants, calculateProgress } from './progress';
import { findCurrentMonthlyGoal } from './trajectory';
import { getHorizonPosition } from './cascadePaths';
import { getWeeklyPlanningDays, isDuringShabbat, toPlanningWeekday } from './sabbath';

export interface PeriodContext {
  vision: Goal;
  monthly: Goal | undefined;
  weekly: Goal | undefined;
  monthProgress: number;
  weekProgress: number;
  visionProgress: number;
}

export interface TodayTasks {
  daily: Goal[];
  timeBlocks: Goal[];
  total: number;
  done: number;
  progress: number;
  complete: boolean;
  shabbat: boolean;
}

export interface TomorrowPreview {
  dayLabel: string;
  title: string | null;
}

/** Abréviation du jour planifié (Dim, Lun, …). */
export function getTodayPlanningDayShort(now = new Date()): string {
  const weekday = toPlanningWeekday(now);
  return getWeeklyPlanningDays().find((d) => d.day === weekday)?.name ?? '';
}

export function isGoalForPlanningDay(goal: Goal, dayShort: string): boolean {
  if (!goal.periodLabel || !dayShort) return false;
  return goal.periodLabel.startsWith(`${dayShort} —`) || goal.periodLabel.startsWith(`${dayShort} `);
}

export function findCurrentWeeklyGoal(
  visionId: string,
  goals: Goal[],
  now = new Date()
): Goal | undefined {
  const vision = goals.find((g) => g.id === visionId);
  if (!vision) return undefined;

  const monthly = findCurrentMonthlyGoal(visionId, goals, now);
  if (!monthly) return undefined;

  const pos = getHorizonPosition(new Date(vision.createdAt), now);
  const weeklies = getChildren(goals, monthly.id)
    .filter((g) => g.level === 'weekly')
    .sort((a, b) => (a.periodLabel ?? '').localeCompare(b.periodLabel ?? ''));

  if (weeklies.length === 0) return undefined;

  const exact = weeklies.find((w) => w.periodLabel?.includes(`Semaine ${pos.weekInMonth}`));
  if (exact) return exact;

  if (pos.weekInMonth <= weeklies.length) {
    return weeklies[pos.weekInMonth - 1];
  }

  return weeklies[weeklies.length - 1];
}

export function getPeriodContext(vision: Goal, goals: Goal[], now = new Date()): PeriodContext {
  const monthly = findCurrentMonthlyGoal(vision.id, goals, now);
  const weekly = findCurrentWeeklyGoal(vision.id, goals, now);

  return {
    vision,
    monthly,
    weekly,
    monthProgress: monthly ? calculateProgress(goals, monthly.id) : 0,
    weekProgress: weekly ? calculateProgress(goals, weekly.id) : 0,
    visionProgress: calculateProgress(goals, vision.id),
  };
}

/** Tâches du jour uniquement (quotidien + blocs horaires rattachés). */
export function getTodayTasksForVision(
  visionId: string,
  goals: Goal[],
  now = new Date()
): Omit<TodayTasks, 'shabbat'> & { daily: Goal[]; timeBlocks: Goal[] } {
  const weekly = findCurrentWeeklyGoal(visionId, goals, now);
  const dayShort = getTodayPlanningDayShort(now);

  if (!weekly || !dayShort) {
    return { daily: [], timeBlocks: [], total: 0, done: 0, progress: 0, complete: true };
  }

  const daily = getChildren(goals, weekly.id).filter(
    (g) => g.level === 'daily' && isGoalForPlanningDay(g, dayShort)
  );

  const dailyIds = new Set(daily.map((d) => d.id));
  const timeBlocks = goals
    .filter((g) => g.level === 'time_block' && g.parentId && dailyIds.has(g.parentId))
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));

  const all = [...daily, ...timeBlocks];
  const done = all.filter((g) => g.completed).length;
  const total = all.length;

  return {
    daily,
    timeBlocks,
    total,
    done,
    progress: total === 0 ? 0 : Math.round((done / total) * 100),
    complete: total > 0 && done === total,
  };
}

export function getTodayTasks(goals: Goal[], visionIds: string[], now = new Date()): TodayTasks {
  if (isDuringShabbat(now)) {
    return {
      daily: [],
      timeBlocks: [],
      total: 0,
      done: 0,
      progress: 0,
      complete: false,
      shabbat: true,
    };
  }

  const daily: Goal[] = [];
  const timeBlocks: Goal[] = [];

  for (const visionId of visionIds) {
    const slice = getTodayTasksForVision(visionId, goals, now);
    daily.push(...slice.daily);
    timeBlocks.push(...slice.timeBlocks);
  }

  const all = [...daily, ...timeBlocks];
  const done = all.filter((g) => g.completed).length;
  const total = all.length;

  return {
    daily,
    timeBlocks,
    total,
    done,
    progress: total === 0 ? 0 : Math.round((done / total) * 100),
    complete: total > 0 && done === total,
    shabbat: false,
  };
}

/** Aperçu de la prochaine journée ouvrée dans la semaine en cours. */
export function getTomorrowPreview(
  visionId: string,
  goals: Goal[],
  now = new Date()
): TomorrowPreview | null {
  const weekly = findCurrentWeeklyGoal(visionId, goals, now);
  if (!weekly) return null;

  const planningDays = getWeeklyPlanningDays();
  const currentIdx = planningDays.findIndex((d) => d.day === toPlanningWeekday(now));
  if (currentIdx < 0 || currentIdx >= planningDays.length - 1) return null;

  const next = planningDays[currentIdx + 1];
  const nextDaily = getChildren(goals, weekly.id).find(
    (g) => g.level === 'daily' && isGoalForPlanningDay(g, next.name)
  );

  return {
    dayLabel: next.name,
    title: nextDaily?.title ?? null,
  };
}

export function getWeekDayStatuses(
  visionId: string,
  goals: Goal[],
  now = new Date()
): { day: string; done: boolean; isToday: boolean }[] {
  const weekly = findCurrentWeeklyGoal(visionId, goals, now);
  if (!weekly) return [];

  const todayShort = getTodayPlanningDayShort(now);

  return getWeeklyPlanningDays().map(({ name }) => {
    const daily = getChildren(goals, weekly.id).find(
      (g) => g.level === 'daily' && isGoalForPlanningDay(g, name)
    );
    const blocks = daily
      ? goals.filter((g) => g.level === 'time_block' && g.parentId === daily.id)
      : [];
    const items = daily ? [daily, ...blocks] : [];
    const done = items.length > 0 && items.every((g) => g.completed);

    return { day: name, done, isToday: name === todayShort };
  });
}

/** Compte les objectifs tactiques sous une vision (debug / plan avancé). */
export function countTacticalGoals(goals: Goal[], visionId: string): number {
  return getDescendants(goals, visionId).filter(
    (g) => g.level === 'weekly' || g.level === 'daily' || g.level === 'time_block'
  ).length;
}
