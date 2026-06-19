import type { PillarId, SwotAnalysis } from '../types';
import type { CascadePathNode } from './cascadePaths';
import { getCascadePaths } from './cascadePaths';
import { buildPlanTitle, dedupePlanTitles } from './planTitles';

export interface VisionPlanInput {
  title: string;
  description: string;
  pillarId: PillarId;
  swot: SwotAnalysis;
}

export interface PlanContent {
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
}

export interface GeneratePlanOptions {
  startDate?: Date;
  now?: Date;
  tacticalOnly?: boolean;
}

function swotHint(swot: SwotAnalysis, year: number, quarterInSem: number): string {
  if (year === 1 && swot.strengths.trim()) {
    return `Appuyer sur : ${swot.strengths.trim().slice(0, 80)}`;
  }
  if (year === 2 && swot.opportunities.trim()) {
    return `Saisir : ${swot.opportunities.trim().slice(0, 80)}`;
  }
  if (quarterInSem === 2 && swot.weaknesses.trim()) {
    return `Réduire : ${swot.weaknesses.trim().slice(0, 60)}`;
  }
  if (swot.threats.trim()) {
    return `Anticiper : ${swot.threats.trim().slice(0, 60)}`;
  }
  return '';
}

function blockTimes(path: CascadePathNode): { startTime: string; endTime: string } {
  const slot = path.periodLabel ?? '07:00–08:00';
  const [startTime, endTime] = slot.split('–').map((s) => s.trim());
  return { startTime: startTime || '07:00', endTime: endTime || '08:00' };
}

/** Générateur local — titres uniques et actionnables par période (sans répéter la vision). */
export function generateSmartPlanContent(path: CascadePathNode, input: VisionPlanInput): PlanContent {
  const hint = swotHint(input.swot, path.year, path.quarterInSem);
  const { title, description } = buildPlanTitle(
    path,
    input.pillarId,
    input.title,
    input.description,
    hint
  );

  if (path.level === 'time_block') {
    const { startTime, endTime } = blockTimes(path);
    return { title, description, startTime, endTime };
  }

  return { title, description };
}

export function generateSmartPlanMap(
  input: VisionPlanInput,
  options: GeneratePlanOptions = {}
): Record<string, PlanContent> {
  const startDate = options.startDate ?? new Date();
  const now = options.now ?? new Date();
  const paths = getCascadePaths(startDate, now);
  const filtered = options.tacticalOnly
    ? paths.filter((p) => p.level === 'weekly' || p.level === 'daily' || p.level === 'time_block')
    : paths;

  const entries: [string, PlanContent][] = filtered.map((path) => [
    path.path,
    generateSmartPlanContent(path, input),
  ]);

  const deduped = dedupePlanTitles(entries);
  return Object.fromEntries(deduped);
}
