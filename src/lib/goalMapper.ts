import type { Goal, GoalLevel, PillarId, SpaceType, Recurrence } from '../types';

export interface GoalRow {
  id: string;
  parent_id: string | null;
  space_type: SpaceType;
  level: GoalLevel;
  pillar_id: PillarId;
  title: string;
  description: string;
  completed: boolean;
  period_label: string | null;
  start_time: string | null;
  end_time: string | null;
  swot_strengths: string | null;
  swot_weaknesses: string | null;
  swot_opportunities: string | null;
  swot_threats: string | null;
  smart_specific: boolean;
  smart_measurable: boolean;
  smart_achievable: boolean;
  smart_realistic: boolean;
  smart_time_bound: boolean;
  created_at: string;
  updated_at: string;
  recurrence?: string | null;
  recurrence_completed_at?: string | null;
  inspiration_image_url?: string | null;
}

function formatTime(time: string | null | undefined): string | undefined {
  if (!time) return undefined;
  return time.slice(0, 5);
}

function hasSwot(row: GoalRow): boolean {
  return Boolean(
    row.swot_strengths || row.swot_weaknesses || row.swot_opportunities || row.swot_threats
  );
}

function hasSmart(row: GoalRow): boolean {
  return (
    row.smart_specific ||
    row.smart_measurable ||
    row.smart_achievable ||
    row.smart_realistic ||
    row.smart_time_bound
  );
}

export function rowToGoal(row: GoalRow): Goal {
  const goal: Goal = {
    id: row.id,
    parentId: row.parent_id,
    spaceType: row.space_type,
    level: row.level,
    pillarId: row.pillar_id,
    title: row.title,
    description: row.description ?? '',
    completed: row.completed,
    periodLabel: row.period_label ?? undefined,
    startTime: formatTime(row.start_time),
    endTime: formatTime(row.end_time),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.recurrence === 'weekly' || row.recurrence === 'monthly') {
    goal.recurrence = row.recurrence as Recurrence;
  }
  if (row.recurrence_completed_at) {
    goal.recurrenceCompletedAt = row.recurrence_completed_at;
  }
  if (row.inspiration_image_url) {
    goal.inspirationImageUrl = row.inspiration_image_url;
  }

  if (hasSwot(row)) {
    goal.swot = {
      strengths: row.swot_strengths ?? '',
      weaknesses: row.swot_weaknesses ?? '',
      opportunities: row.swot_opportunities ?? '',
      threats: row.swot_threats ?? '',
    };
  }

  if (hasSmart(row)) {
    goal.smart = {
      specific: row.smart_specific,
      measurable: row.smart_measurable,
      achievable: row.smart_achievable,
      realistic: row.smart_realistic,
      timeBound: row.smart_time_bound,
    };
  }

  return goal;
}

export function goalToRow(goal: Goal): Record<string, unknown> {
  return {
    id: goal.id,
    parent_id: goal.parentId,
    space_type: goal.spaceType,
    level: goal.level,
    pillar_id: goal.pillarId,
    title: goal.title,
    description: goal.description,
    completed: goal.completed,
    period_label: goal.periodLabel ?? null,
    start_time: goal.startTime ?? null,
    end_time: goal.endTime ?? null,
    swot_strengths: goal.swot?.strengths ?? null,
    swot_weaknesses: goal.swot?.weaknesses ?? null,
    swot_opportunities: goal.swot?.opportunities ?? null,
    swot_threats: goal.swot?.threats ?? null,
    smart_specific: goal.smart?.specific ?? false,
    smart_measurable: goal.smart?.measurable ?? false,
    smart_achievable: goal.smart?.achievable ?? false,
    smart_realistic: goal.smart?.realistic ?? false,
    smart_time_bound: goal.smart?.timeBound ?? false,
    recurrence: goal.recurrence && goal.recurrence !== 'none' ? goal.recurrence : null,
    recurrence_completed_at: goal.recurrenceCompletedAt ?? null,
    inspiration_image_url: goal.inspirationImageUrl ?? null,
    created_at: goal.createdAt,
    updated_at: goal.updatedAt,
  };
}
