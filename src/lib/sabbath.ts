import { useSabbathStore } from '../store/useSabbathStore';
import {
  DEFAULT_SUNSET_TIME,
  formatSunsetDisplay,
  getSunsetMinutesFromTime,
  normalizeSunsetTime,
  parseClockToMinutes,
} from './sabbathTime';

export {
  DEFAULT_SUNSET_TIME,
  normalizeSunsetTime,
  formatSunsetDisplay,
  parseClockToMinutes,
} from './sabbathTime';

export interface PlanningDay {
  /** 1 = lun … 5 = ven, 7 = dim ; 6 = sam (jamais planifié) */
  day: number;
  name: string;
}

/** Heure configurée par l'utilisateur (store persisté). */
export function getConfiguredSunsetTime(): string {
  if (typeof window === 'undefined') return DEFAULT_SUNSET_TIME;
  return normalizeSunsetTime(useSabbathStore.getState().sunsetTime);
}

export function getSunsetMinutes(sunsetTime?: string): number {
  return getSunsetMinutesFromTime(sunsetTime ?? getConfiguredSunsetTime());
}

export function toPlanningWeekday(date: Date): number {
  return date.getDay() === 0 ? 7 : date.getDay();
}

/**
 * Sabbat : du vendredi au coucher du soleil au samedi au coucher du soleil.
 */
export function isDuringShabbat(now = new Date(), sunsetTime?: string): boolean {
  const sunset = getSunsetMinutes(sunsetTime);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const day = now.getDay();

  if (day === 5 && minutes >= sunset) return true;
  if (day === 6 && minutes < sunset) return true;
  return false;
}

export function isSaturday(day: number): boolean {
  return day === 6;
}

/** Jours ouvrés planifiés : dim → ven (pas de samedi). */
export function getWeeklyPlanningDays(): PlanningDay[] {
  return [
    { day: 7, name: 'Dim' },
    { day: 1, name: 'Lun' },
    { day: 2, name: 'Mar' },
    { day: 3, name: 'Mer' },
    { day: 4, name: 'Jeu' },
    { day: 5, name: 'Ven' },
  ];
}

export function shouldGenerateTimeBlocksForDay(
  planningDay: number,
  now = new Date(),
  sunsetTime?: string
): boolean {
  if (isSaturday(planningDay)) return false;
  if (toPlanningWeekday(now) !== planningDay) return false;
  if (isDuringShabbat(now, sunsetTime)) return false;
  return true;
}

export interface TimeBlockSlot {
  start: string;
  end: string;
  suffix: string;
}

export const DEFAULT_TIME_BLOCKS: TimeBlockSlot[] = [
  { start: '07:00', end: '08:00', suffix: 'Matin — focus' },
  { start: '12:30', end: '13:00', suffix: 'Midi — point' },
  { start: '18:00', end: '19:00', suffix: 'Soir — action clé' },
];

/** Le vendredi, les blocs se terminent avant le coucher du soleil. */
export function filterTimeBlocksForDay(
  blocks: TimeBlockSlot[],
  planningDay: number,
  sunsetTime?: string
): TimeBlockSlot[] {
  if (planningDay !== 5) return blocks;
  const sunset = getSunsetMinutes(sunsetTime);
  return blocks.filter((b) => parseClockToMinutes(b.end) <= sunset);
}

export function getShabbatMessage(sunsetTime?: string): string {
  const t = formatSunsetDisplay(sunsetTime ?? getConfiguredSunsetTime());
  return `Sabbat — repos du vendredi ${t} au samedi ${t}. Aucune tâche professionnelle planifiée.`;
}

export function getShabbatScheduleSummary(sunsetTime?: string): {
  startLabel: string;
  endLabel: string;
  duringNow: boolean;
} {
  const t = formatSunsetDisplay(sunsetTime ?? getConfiguredSunsetTime());
  return {
    startLabel: `Vendredi ${t}`,
    endLabel: `Samedi ${t}`,
    duringNow: isDuringShabbat(undefined, sunsetTime),
  };
}
