import type { PillarId, SwotAnalysis } from '../src/types';
import {
  DEFAULT_TIME_BLOCKS,
  filterTimeBlocksForDay,
  getWeeklyPlanningDays,
  shouldGenerateTimeBlocksForDay,
} from '../src/lib/sabbath';
import { DEFAULT_SUNSET_TIME, normalizeSunsetTime } from '../src/lib/sabbathTime';

export interface VisionPlanInput {
  title: string;
  description: string;
  pillarId: PillarId;
  swot: SwotAnalysis;
  startDate?: string;
  tacticalOnly?: boolean;
  sunsetTime?: string;
}

export interface PlanContent {
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
}

type CascadePathNode = {
  path: string;
  level: string;
  periodLabel: string;
  year: number;
  semester: number;
  quarterInSem: number;
  monthInQuarter: number;
  weekInMonth?: number;
};

function enumeratePaths(startDate = new Date(), now = new Date(), sunsetTime = DEFAULT_SUNSET_TIME): CascadePathNode[] {
  const sunset = normalizeSunsetTime(sunsetTime);
  const nodes: CascadePathNode[] = [];
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
    nodes.push({ path: yPath, level: 'annual', periodLabel: `An ${year}`, year, semester: 0, quarterInSem: 0, monthInQuarter: 0 });
    for (const semester of [1, 2]) {
      const sPath = `${year}.${semester}`;
      nodes.push({ path: sPath, level: 'semester', periodLabel: `An ${year} · S${semester}`, year, semester, quarterInSem: 0, monthInQuarter: 0 });
      for (const quarterInSem of [1, 2]) {
        const quarterIndex = (year - 1) * 4 + (semester - 1) * 2 + quarterInSem;
        const qPath = `${sPath}.${quarterInSem}`;
        nodes.push({ path: qPath, level: 'quarterly', periodLabel: `T${quarterIndex}`, year, semester, quarterInSem, monthInQuarter: 0 });
        for (const monthInQuarter of [1, 2, 3]) {
          const mPath = `${qPath}.${monthInQuarter}`;
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + globalMonth);
          const calLabel = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
          const periodLabel = calLabel.charAt(0).toUpperCase() + calLabel.slice(1);
          nodes.push({ path: mPath, level: 'monthly', periodLabel, year, semester, quarterInSem, monthInQuarter });
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
                level: 'weekly',
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
                    level: 'daily',
                    periodLabel: `${name} — Quotidien`,
                    year,
                    semester,
                    quarterInSem,
                    monthInQuarter,
                    weekInMonth: week,
                  });
                  if (shouldGenerateTimeBlocksForDay(day, now, sunset)) {
                    const blocks = filterTimeBlocksForDay(DEFAULT_TIME_BLOCKS, day, sunset);
                    blocks.forEach((b, i) => {
                      nodes.push({
                        path: `${dPath}.tb${i + 1}`,
                        level: 'time_block',
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

Génère un objectif CONCRET pour chaque période (rétro-planification année→jour, blocs horaires pour aujourd'hui).
Respect du sabbat : aucune tâche du vendredi soir au samedi soir ; semaine de planification dim.–ven. ; vendredi blocs avant le coucher du soleil (${sunset}).

${pathList}

JSON uniquement : { "plans": { "1": { "title": "...", "description": "..." }, "1.1.1.1.w1.d3.tb1": { "title": "07:00 – 08:00 : ...", "description": "...", "startTime": "07:00", "endTime": "08:00" } } }
title max 120 car., description max 200 car., en français.`;
}

export function generateSmartPlanMap(input: VisionPlanInput): Record<string, PlanContent> {
  const vision = input.title.trim();
  const short = vision.length > 42 ? `${vision.slice(0, 42)}…` : vision;
  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  const sunset = normalizeSunsetTime(input.sunsetTime ?? DEFAULT_SUNSET_TIME);
  const paths = enumeratePaths(startDate, new Date(), sunset);
  const filtered = input.tacticalOnly
    ? paths.filter((p) => p.level === 'weekly' || p.level === 'daily' || p.level === 'time_block')
    : paths;
  const map: Record<string, PlanContent> = {};

  for (const p of filtered) {
    switch (p.level) {
      case 'annual':
        map[p.path] = {
          title: `An ${p.year} — ${p.year === 1 ? 'Lancer' : 'Atteindre'} : ${short}`,
          description: `Jalon ${p.year === 1 ? 'de fondation' : 'de consolidation'} pour « ${vision} ».`,
        };
        break;
      case 'semester':
        map[p.path] = {
          title: `S${p.semester} (An ${p.year}) — Objectifs 6 mois`,
          description: `Plan semestriel aligné sur la vision « ${short} ».`,
        };
        break;
      case 'quarterly':
        map[p.path] = {
          title: `Trimestre ${p.quarterInSem} — Actions clés`,
          description: `Objectifs du trimestre pour progresser vers « ${short} ».`,
        };
        break;
      case 'monthly':
        map[p.path] = {
          title: `${p.periodLabel} — Priorités`,
          description: `Tâches du mois liées à la vision.`,
        };
        break;
      case 'weekly':
        map[p.path] = {
          title: `Semaine ${p.weekInMonth ?? 1} — Plan d'exécution`,
          description: `Répartition hebdomadaire pour « ${short} ».`,
        };
        break;
      case 'daily':
        map[p.path] = {
          title: `Action du jour — ${short}`,
          description: `Micro-tâche quotidienne vers la vision 2 ans.`,
        };
        break;
      case 'time_block': {
        const [start, end] = p.periodLabel.split('–');
        map[p.path] = {
          title: `${start} – ${end} : Action clé`,
          description: `Bloc horaire dédié à la vision.`,
          startTime: start,
          endTime: end,
        };
        break;
      }
    }
  }
  return map;
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

