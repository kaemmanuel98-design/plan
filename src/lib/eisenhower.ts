import type { Goal } from '../types';
import { findRootVision } from './progress';
import { getPillar } from '../data/pillars';
import { getTodayTasks } from './currentFocus';
import { isDuringShabbat } from './sabbath';

export type EisenhowerQuadrant = 'do' | 'schedule' | 'delegate' | 'eliminate';

export interface ClassifiedTask {
  goal: Goal;
  quadrant: EisenhowerQuadrant;
  /** Contexte court : créneau horaire ou jour planifié */
  context?: string;
}

const QUADRANT_META: Record<
  EisenhowerQuadrant,
  { label: string; subtitle: string; hint: string; color: string }
> = {
  do: {
    label: 'Faire',
    subtitle: 'Urgent · Important',
    hint: 'À traiter maintenant',
    color: '#ff375f',
  },
  schedule: {
    label: 'Planifier',
    subtitle: 'Important',
    hint: 'Prévu plus tard dans la journée',
    color: '#0a84ff',
  },
  delegate: {
    label: 'Déléguer',
    subtitle: 'Urgent · À deux',
    hint: 'Peut être partagé avec le partenaire',
    color: '#ff9500',
  },
  eliminate: {
    label: 'Reporter',
    subtitle: 'Non prioritaire',
    hint: 'Peut attendre demain',
    color: '#9b9b96',
  },
};

export function getQuadrantMeta(q: EisenhowerQuadrant) {
  return QUADRANT_META[q];
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function nowMinutes(now = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

function isPrimaryVisionTask(goal: Goal, goals: Goal[], primaryVisionId?: string): boolean {
  if (!primaryVisionId) return true;
  const root = findRootVision(goals, goal.id);
  return root?.id === primaryVisionId;
}

/** Bloc horaire en cours, imminente (≤ 45 min) ou en retard. */
function isTimeBlockUrgent(goal: Goal, now = new Date()): boolean {
  if (!goal.startTime || !goal.endTime) return goal.level === 'time_block';
  const nowM = nowMinutes(now);
  const start = parseTime(goal.startTime);
  const end = parseTime(goal.endTime);
  if (nowM > end + 15 && !goal.completed) return true;
  return nowM >= start - 45 && nowM <= end + 10;
}

/** Bloc horaire plus tard dans la journée. */
function isTimeBlockLaterToday(goal: Goal, now = new Date()): boolean {
  if (!goal.startTime) return false;
  return parseTime(goal.startTime) > nowMinutes(now) + 45;
}

function isDailyUrgent(_goal: Goal, timeBlocks: Goal[], now = new Date()): boolean {
  const pendingBlocks = timeBlocks.filter((b) => !b.completed);
  if (pendingBlocks.some((b) => isTimeBlockUrgent(b, now))) return false;
  if (pendingBlocks.length === 0) return true;
  return now.getHours() >= 16;
}

function taskContext(goal: Goal): string | undefined {
  if (goal.level === 'time_block' && goal.startTime && goal.endTime) {
    return `${goal.startTime} – ${goal.endTime}`;
  }
  if (goal.periodLabel) {
    return goal.periodLabel.split('—')[0]?.trim();
  }
  return undefined;
}

function classifyTask(
  goal: Goal,
  goals: Goal[],
  timeBlocks: Goal[],
  primaryVisionId?: string,
  now = new Date()
): ClassifiedTask {
  const primary = isPrimaryVisionTask(goal, goals, primaryVisionId);
  const important = primary || goal.spaceType === 'shared';

  let urgent = false;
  if (goal.level === 'time_block') {
    urgent = isTimeBlockUrgent(goal, now);
  } else if (goal.level === 'daily') {
    urgent = isDailyUrgent(goal, timeBlocks, now);
  }

  const coupleDelegate =
    goal.spaceType === 'shared' &&
    goal.pillarId === 'couple_famille' &&
    urgent &&
    goal.level === 'daily';

  let quadrant: EisenhowerQuadrant;
  if (coupleDelegate && !goal.completed) {
    quadrant = 'delegate';
  } else if (goal.level === 'time_block' && isTimeBlockLaterToday(goal, now) && !isTimeBlockUrgent(goal, now)) {
    quadrant = 'schedule';
  } else if (urgent && important) {
    quadrant = 'do';
  } else if (important) {
    quadrant = 'schedule';
  } else if (urgent) {
    quadrant = 'delegate';
  } else {
    quadrant = 'eliminate';
  }

  return {
    goal,
    quadrant,
    context: taskContext(goal),
  };
}

/** Classifie uniquement les tâches du jour (aligné sur l’accueil / Focus). */
export function classifyTodayTasks(
  goals: Goal[],
  visionIds: string[],
  primaryVisionId?: string,
  now = new Date()
): ClassifiedTask[] {
  if (isDuringShabbat(now)) return [];

  const slice = getTodayTasks(goals, visionIds, now);
  const tasks = [...slice.daily, ...slice.timeBlocks];

  return tasks.map((goal) =>
    classifyTask(goal, goals, slice.timeBlocks, primaryVisionId, now)
  );
}

/** @deprecated Utiliser classifyTodayTasks */
export function classifyDailyTasks(goals: Goal[]): ClassifiedTask[] {
  const visionIds = goals.filter((g) => g.level === 'global_vision').map((g) => g.id);
  return classifyTodayTasks(goals, visionIds, visionIds[0]);
}

export function groupByQuadrant(classified: ClassifiedTask[]) {
  const groups: Record<EisenhowerQuadrant, ClassifiedTask[]> = {
    do: [],
    schedule: [],
    delegate: [],
    eliminate: [],
  };
  for (const item of classified) {
    groups[item.quadrant].push(item);
  }

  for (const q of Object.keys(groups) as EisenhowerQuadrant[]) {
    groups[q].sort((a, b) => {
      if (a.goal.level === 'time_block' && b.goal.level === 'time_block') {
        return (a.goal.startTime ?? '').localeCompare(b.goal.startTime ?? '');
      }
      if (a.goal.level === 'time_block') return -1;
      if (b.goal.level === 'time_block') return 1;
      return 0;
    });
  }

  return groups;
}

export function getPillarColorForTask(goal: Goal) {
  return getPillar(goal.pillarId).color;
}

export function countQuadrantTasks(groups: Record<EisenhowerQuadrant, ClassifiedTask[]>) {
  return (['do', 'schedule', 'delegate', 'eliminate'] as const).reduce(
    (n, q) => n + groups[q].length,
    0
  );
}
