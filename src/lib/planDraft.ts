import type { GoalLevel } from '../types';
import type { PlanContent } from './smartPlanGenerator';
import type { CascadePathNode } from './retroPlanning';
import type { PlanSource } from './aiPlanClient';

export interface DraftPlanItem extends PlanContent {
  path: string;
  level: GoalLevel;
  periodLabel: string;
}

export interface PlanDraft {
  items: DraftPlanItem[];
  source: PlanSource;
  generatedAt: string;
}

export function plansToDraft(
  paths: CascadePathNode[],
  plans: Record<string, PlanContent>,
  source: PlanSource
): PlanDraft {
  return {
    items: paths.map((p) => ({
      path: p.path,
      level: p.level,
      periodLabel: p.periodLabel,
      title: plans[p.path]?.title ?? `Objectif ${p.periodLabel}`,
      description: plans[p.path]?.description ?? '',
      startTime: plans[p.path]?.startTime,
      endTime: plans[p.path]?.endTime,
    })),
    source,
    generatedAt: new Date().toISOString(),
  };
}

export function draftToPlansMap(draft: DraftPlanItem[]): Record<string, PlanContent> {
  const map: Record<string, PlanContent> = {};
  for (const item of draft) {
    map[item.path] = {
      title: item.title,
      description: item.description,
      startTime: item.startTime,
      endTime: item.endTime,
    };
  }
  return map;
}
