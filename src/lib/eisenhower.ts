import type { Goal } from '../types';
import { findRootVision } from './progress';
import { getPillar } from '../data/pillars';

export type EisenhowerQuadrant = 'do' | 'schedule' | 'delegate' | 'eliminate';

export interface ClassifiedTask {
  goal: Goal;
  quadrant: EisenhowerQuadrant;
  visionTitle?: string;
}

const QUADRANT_META: Record<
  EisenhowerQuadrant,
  { label: string; subtitle: string; color: string }
> = {
  do: { label: 'Faire', subtitle: 'Urgent · Important', color: '#ff375f' },
  schedule: { label: 'Planifier', subtitle: 'Important', color: '#0a84ff' },
  delegate: { label: 'Déléguer', subtitle: 'Urgent', color: '#ff9500' },
  eliminate: { label: 'Simplifier', subtitle: 'Plus tard', color: '#9b9b96' },
};

export function getQuadrantMeta(q: EisenhowerQuadrant) {
  return QUADRANT_META[q];
}

function isUrgent(goal: Goal, allGoals: Goal[]): boolean {
  if (goal.level === 'time_block') return true;
  if (goal.startTime) {
    const [h, m] = goal.startTime.split(':').map(Number);
    const now = new Date();
    const block = new Date();
    block.setHours(h, m, 0, 0);
    const diff = block.getTime() - now.getTime();
    return diff < 2 * 60 * 60 * 1000;
  }
  const parent = allGoals.find((g) => g.id === goal.parentId);
  if (parent?.level === 'weekly' && !parent.completed) return true;
  return false;
}

function isImportant(goal: Goal, allGoals: Goal[]): boolean {
  const root = findRootVision(allGoals, goal.id);
  if (!root) return goal.spaceType === 'shared';
  const descendants = allGoals.filter((g) => {
    let cur: Goal | undefined = g;
    while (cur) {
      if (cur.id === root.id) return true;
      cur = cur.parentId ? allGoals.find((x) => x.id === cur!.parentId) : undefined;
    }
    return false;
  });
  const done = descendants.filter((g) => g.completed).length;
  const progress = descendants.length ? done / descendants.length : 0;
  return progress < 0.85 || root.pillarId === goal.pillarId;
}

export function classifyDailyTasks(goals: Goal[]): ClassifiedTask[] {
  const tasks = goals.filter((g) => g.level === 'daily' || g.level === 'time_block');

  return tasks.map((goal) => {
    const urgent = isUrgent(goal, goals);
    const important = isImportant(goal, goals);
    const root = findRootVision(goals, goal.id);

    let quadrant: EisenhowerQuadrant;
    if (urgent && important) quadrant = 'do';
    else if (important) quadrant = 'schedule';
    else if (urgent) quadrant = 'delegate';
    else quadrant = 'eliminate';

    return {
      goal,
      quadrant,
      visionTitle: root?.title,
    };
  });
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
  return groups;
}

export function getPillarColorForTask(goal: Goal) {
  return getPillar(goal.pillarId).color;
}
