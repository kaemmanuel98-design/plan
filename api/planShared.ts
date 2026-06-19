import type { PillarId, SwotAnalysis, GoalLevel } from '../src/types/index.js';
import {
  DEFAULT_TIME_BLOCKS,
  filterTimeBlocksForDay,
  getWeeklyPlanningDays,
  shouldGenerateTimeBlocksForDay,
} from '../src/lib/sabbathCore.js';
import { DEFAULT_SUNSET_TIME, normalizeSunsetTime } from '../src/lib/sabbathTime.js';
import { buildPlanTitle, dedupePlanTitles } from '../src/lib/planTitles.js';

export interface PlanContent {
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
}

export interface VisionPlanInput {
  title: string;
  description: string;
  pillarId: PillarId;
  swot: SwotAnalysis;
  startDate?: string;
  tacticalOnly?: boolean;
  sunsetTime?: string;
}

type ApiCascadePathNode = {
  path: string;
  parentPath: null;
  level: GoalLevel;
  periodLabel: string;
  year: number;
  semester: number;
  quarterInSem: number;
  monthInQuarter: number;
  weekInMonth?: number;
  dayInWeek?: number;
};

function enumeratePaths(startDate = new Date(), now = new Date(), sunsetTime = DEFAULT_SUNSET_TIME): ApiCascadePathNode[] {
  const sunset = normalizeSunsetTime(sunsetTime);
  const nodes: ApiCascadePathNode[] = [];
  const monthsFromStart = Math.max(
    0,
    Math.min(
      23,
      (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
    )
  );
  const posYear = monthsFromStart < 12 ? 1 : 2;
  const monthInYear = monthsFromStart % 12;
  const posSemester = monthInYear < 6 ? 1 : 2;
  const monthInSemester = monthInYear % 6;
  const posQuarter = monthInSemester < 3 ? 1 : 2;
  const posMonthInQuarter = (monthInSemester % 3) + 1;
  const weekInMonth = Math.min(4, Math.max(1, Math.ceil(now.getDate() / 7)));

  let globalMonth = 0;

  for (const year of [1, 2]) {
    const yPath = String(year);
    nodes.push({ path: yPath, parentPath: null, level: 'annual' as GoalLevel, periodLabel: `An ${year}`, year, semester: 0, quarterInSem: 0, monthInQuarter: 0 });
    for (const semester of [1, 2]) {
      const sPath = `${year}.${semester}`;
      nodes.push({ path: sPath, parentPath: null, level: 'semester' as GoalLevel, periodLabel: `An ${year} · S${semester}`, year, semester, quarterInSem: 0, monthInQuarter: 0 });
      for (const quarterInSem of [1, 2]) {
        const quarterIndex = (year - 1) * 4 + (semester - 1) * 2 + quarterInSem;
        const qPath = `${sPath}.${quarterInSem}`;
        nodes.push({ path: qPath, parentPath: null, level: 'quarterly' as GoalLevel, periodLabel: `T${quarterIndex}`, year, semester, quarterInSem, monthInQuarter: 0 });
        for (const monthInQuarter of [1, 2, 3]) {
          const mPath = `${qPath}.${monthInQuarter}`;
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + globalMonth);
          const calLabel = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
          const periodLabel = calLabel.charAt(0).toUpperCase() + calLabel.slice(1);
          nodes.push({ path: mPath, parentPath: null, level: 'monthly' as GoalLevel, periodLabel, year, semester, quarterInSem, monthInQuarter });
          globalMonth++;

          const isCurrent =
            year === posYear &&
            semester === posSemester &&
            quarterInSem === posQuarter &&
            monthInQuarter === posMonthInQuarter;

          if (isCurrent) {
            for (let week = 1; week <= 4; week++) {
              const wPath = `${mPath}.w${week}`;
              nodes.push({
                path: wPath,
                parentPath: null,
                level: 'weekly' as GoalLevel,
                periodLabel: `${periodLabel} · Semaine ${week}`,
                year,
                semester,
                quarterInSem,
                monthInQuarter,
                weekInMonth: week,
              });
              if (week === weekInMonth) {
                for (const { day, name } of getWeeklyPlanningDays()) {
                  const dPath = `${wPath}.d${day}`;
                  nodes.push({
                    path: dPath,
                    parentPath: null,
                    level: 'daily' as GoalLevel,
                    periodLabel: `${name} — Quotidien`,
                    year,
                    semester,
                    quarterInSem,
                    monthInQuarter,
                    weekInMonth: week,
                    dayInWeek: day,
                  });
                  if (shouldGenerateTimeBlocksForDay(day, now, sunset)) {
                    const blocks = filterTimeBlocksForDay(DEFAULT_TIME_BLOCKS, day, sunset);
                    blocks.forEach((b, i) => {
                      nodes.push({
                        path: `${dPath}.tb${i + 1}`,
                        parentPath: null,
                        level: 'time_block' as GoalLevel,
                        periodLabel: `${b.start}–${b.end}`,
                        year,
                        semester,
                        quarterInSem,
                        monthInQuarter,
                        weekInMonth: week,
                      });
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return nodes;
}

const PILLAR_LABELS: Record<PillarId, string> = {
  financier: 'Financier',
  sport_sante: 'Sport & Santé',
  carriere: 'Carrière',
  couple_famille: 'Couple & Famille',
  developpement: 'Développement personnel',
};

export function buildAiPrompt(input: VisionPlanInput): string {
  const sunset = normalizeSunsetTime(input.sunsetTime ?? DEFAULT_SUNSET_TIME);
  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  const paths = enumeratePaths(startDate, new Date(), sunset);
  const filtered = input.tacticalOnly
    ? paths.filter((p) => p.level === 'weekly' || p.level === 'daily' || p.level === 'time_block')
    : paths;
  const pathList = filtered.map((p) => `- "${p.path}" (${p.level}, ${p.periodLabel})`).join('\n');

  return `Tu es un coach expert en rétro-planification de vie sur 2 ans.

VISION : "${input.title}"
DESCRIPTION : ${input.description || '—'}
PILIER : ${PILLAR_LABELS[input.pillarId]}
SWOT — Forces: ${input.swot.strengths || '—'} | Faiblesses: ${input.swot.weaknesses || '—'} | Opportunités: ${input.swot.opportunities || '—'} | Menaces: ${input.swot.threats || '—'}

Génère un objectif CONCRET et UNIQUE pour chaque période (rétro-planification année→jour, blocs horaires pour aujourd'hui).

RÈGLES TITRES (obligatoires) :
- NE JAMAIS répéter le titre de la vision (« ${input.title} ») dans les objectifs enfants
- Chaque titre = action spécifique (verbe + quoi faire + résultat)
- 24 mois = 24 titres mensuels différents, progressifs vers la vision
- Pas de doublons entre périodes

Respect du sabbat : aucune tâche du vendredi soir au samedi soir ; semaine de planification dim.–ven. ; vendredi blocs avant le coucher du soleil (${sunset}).

${pathList}

JSON uniquement : { "plans": { "1": { "title": "...", "description": "..." }, "1.1.1.1.w1.d3.tb1": { "title": "07:00 – 08:00 : ...", "description": "...", "startTime": "07:00", "endTime": "08:00" } } }
title max 120 car., description max 200 car., en français.`;
}

export function generateSmartPlanMap(input: VisionPlanInput): Record<string, PlanContent> {
  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  const sunset = normalizeSunsetTime(input.sunsetTime ?? DEFAULT_SUNSET_TIME);
  const paths = enumeratePaths(startDate, new Date(), sunset);
  const filtered = input.tacticalOnly
    ? paths.filter((p) => p.level === 'weekly' || p.level === 'daily' || p.level === 'time_block')
    : paths;

  const planInput = {
    title: input.title,
    description: input.description,
    pillarId: input.pillarId,
    swot: input.swot,
  };

  const entries: [string, PlanContent][] = filtered.map((pathNode) => {
    const { title, description } = buildPlanTitle(
      pathNode,
      input.pillarId,
      input.title,
      input.description
    );

    if (pathNode.level === 'time_block') {
      const [startTime, endTime] = pathNode.periodLabel.split('–').map((s) => s.trim());
      return [pathNode.path, { title, description, startTime, endTime }];
    }

    return [pathNode.path, { title, description }];
  });

  return Object.fromEntries(dedupePlanTitles(entries));
}

export function getCascadePathsForInput(input: VisionPlanInput) {
  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  const sunset = normalizeSunsetTime(input.sunsetTime ?? DEFAULT_SUNSET_TIME);
  const paths = enumeratePaths(startDate, new Date(), sunset);
  return input.tacticalOnly
    ? paths.filter((p) => p.level === 'weekly' || p.level === 'daily' || p.level === 'time_block')
    : paths;
}

export const CASCADE_PATHS = enumeratePaths();

