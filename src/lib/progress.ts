import type { Goal, GoalLevel } from '../types';
import { GOAL_LEVELS } from '../types';

export function getChildLevel(level: GoalLevel): GoalLevel | undefined {
  return GOAL_LEVELS.find((l) => l.level === level)?.childLevel;
}

export function getParentLevel(level: GoalLevel): GoalLevel | undefined {
  const idx = GOAL_LEVELS.findIndex((l) => l.level === level);
  return idx > 0 ? GOAL_LEVELS[idx - 1].level : undefined;
}

export function getChildren(goals: Goal[], parentId: string): Goal[] {
  return goals.filter((g) => g.parentId === parentId);
}

export function getDescendants(goals: Goal[], parentId: string): Goal[] {
  const children = getChildren(goals, parentId);
  return children.flatMap((c) => [c, ...getDescendants(goals, c.id)]);
}

export function calculateProgress(goals: Goal[], goalId: string): number {
  const descendants = getDescendants(goals, goalId);
  if (descendants.length === 0) {
    const goal = goals.find((g) => g.id === goalId);
    return goal?.completed ? 100 : 0;
  }
  const completed = descendants.filter((g) => g.completed).length;
  return Math.round((completed / descendants.length) * 100);
}

export function findRootVision(goals: Goal[], goalId: string): Goal | null {
  let current = goals.find((g) => g.id === goalId);
  if (!current) return null;
  while (current.parentId) {
    const parent = goals.find((g) => g.id === current!.parentId);
    if (!parent) break;
    current = parent;
  }
  return current.level === 'global_vision' ? current : null;
}

export function getLevelLabel(level: GoalLevel): string {
  return GOAL_LEVELS.find((l) => l.level === level)?.label ?? level;
}

export function generateId(): string {
  return crypto.randomUUID();
}
