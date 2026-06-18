import type { Goal } from '../types';
import { generateId, getDescendants } from './progress';
import { sanitizeDescription, sanitizeTitle } from './sanitize';
import { getCascadePaths } from './cascadePaths';
import type { PlanContent } from './smartPlanGenerator';
import { isTacticalLevel, getHorizonPosition } from './retroPlanning';

export function getCascadePathCount(startDate = new Date(), now = new Date()): number {
  return getCascadePaths(startDate, now).length;
}

const CASCADE_LEVELS = [
  'annual',
  'semester',
  'quarterly',
  'monthly',
  'weekly',
  'daily',
  'time_block',
] as const;

export function buildVisionCascadeGoals(
  vision: Goal,
  plans: Record<string, PlanContent>,
  startDate: Date = new Date(vision.createdAt)
): Goal[] {
  const now = new Date();
  const paths = getCascadePaths(startDate, now);
  const pathToId = new Map<string, string>();
  const goals: Goal[] = [];
  const created = new Date().toISOString();

  for (const pathNode of paths) {
    const content = plans[pathNode.path] ?? {
      title: `Objectif ${pathNode.periodLabel}`,
      description: '',
    };

    const id = generateId();
    pathToId.set(pathNode.path, id);

    const parentId = pathNode.parentPath ? pathToId.get(pathNode.parentPath) ?? vision.id : vision.id;

    goals.push({
      id,
      parentId,
      spaceType: vision.spaceType,
      level: pathNode.level,
      pillarId: vision.pillarId,
      title: sanitizeTitle(content.title),
      description: sanitizeDescription(content.description),
      completed: false,
      periodLabel: pathNode.periodLabel,
      startTime: content.startTime,
      endTime: content.endTime,
      createdAt: created,
      updatedAt: created,
    });
  }

  return goals;
}

export function buildExpandedLevelsForCascade(visionId: string, cascade: Goal[]): Record<string, boolean> {
  const expanded: Record<string, boolean> = { [visionId]: true };
  for (const g of cascade) {
    if (g.level === 'annual' || g.level === 'semester' || g.level === 'quarterly' || g.level === 'monthly') {
      expanded[g.id] = true;
    }
  }
  return expanded;
}

export interface CascadeLevelStat {
  level: (typeof CASCADE_LEVELS)[number];
  label: string;
  total: number;
  completed: number;
  percent: number;
}

const LEVEL_SHORT: Record<string, string> = {
  annual: 'An',
  semester: '6 mois',
  quarterly: 'Trim.',
  monthly: 'Mois',
  weekly: 'Sem.',
  daily: 'Jour',
  time_block: 'Blocs',
};

export function getCascadeLevelStats(allGoals: Goal[], visionId: string): CascadeLevelStat[] {
  const descendants = getDescendants(allGoals, visionId);

  return CASCADE_LEVELS.map((level) => {
    const atLevel = descendants.filter((g) => g.level === level);
    const completed = atLevel.filter((g) => g.completed).length;
    const total = atLevel.length;
    return {
      level,
      label: LEVEL_SHORT[level],
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
}

/** Remplace les objectifs tactiques (semaine/jour/blocs) du mois en cours. */
export function replaceTacticalCascade(
  vision: Goal,
  monthlyGoal: Goal,
  allGoals: Goal[],
  plans: Record<string, PlanContent>,
  startDate: Date = new Date(vision.createdAt),
  now: Date = new Date()
): { toRemove: string[]; toAdd: Goal[] } {
  const pos = getHorizonPosition(startDate, now);
  const monthPath = pos.monthPath;
  const paths = getCascadePaths(startDate, now).filter(
    (p) => isTacticalLevel(p.level) && p.path.startsWith(`${monthPath}.`)
  );

  const toRemove = getDescendants(allGoals, monthlyGoal.id)
    .filter((g) => isTacticalLevel(g.level))
    .map((g) => g.id);

  const pathToId = new Map<string, string>();
  pathToId.set(monthPath, monthlyGoal.id);

  const created = new Date().toISOString();
  const toAdd: Goal[] = [];

  for (const pathNode of paths) {
    const content = plans[pathNode.path] ?? {
      title: `Objectif ${pathNode.periodLabel}`,
      description: '',
    };
    const id = generateId();
    pathToId.set(pathNode.path, id);
    const parentId = pathNode.parentPath ? pathToId.get(pathNode.parentPath) ?? monthlyGoal.id : monthlyGoal.id;

    toAdd.push({
      id,
      parentId,
      spaceType: vision.spaceType,
      level: pathNode.level,
      pillarId: vision.pillarId,
      title: sanitizeTitle(content.title),
      description: sanitizeDescription(content.description),
      completed: false,
      periodLabel: pathNode.periodLabel,
      startTime: content.startTime,
      endTime: content.endTime,
      createdAt: created,
      updatedAt: created,
    });
  }

  return { toRemove, toAdd };
}

export function collectDescendantIds(goals: Goal[], rootId: string): string[] {
  return getDescendants(goals, rootId).map((g) => g.id);
}
