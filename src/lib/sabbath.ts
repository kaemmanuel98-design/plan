import { useSabbathStore } from '../store/useSabbathStore';
import {
  DEFAULT_SUNSET_TIME,
  formatSunsetDisplay,
  isDuringShabbat,
  normalizeSunsetTime,
} from './sabbathCore';

export {
  DEFAULT_SUNSET_TIME,
  normalizeSunsetTime,
  formatSunsetDisplay,
  parseClockToMinutes,
  getSunsetMinutes,
  toPlanningWeekday,
  isDuringShabbat,
  isSaturday,
  getWeeklyPlanningDays,
  shouldGenerateTimeBlocksForDay,
  filterTimeBlocksForDay,
  DEFAULT_TIME_BLOCKS,
  type PlanningDay,
  type TimeBlockSlot,
} from './sabbathCore';

/** Heure configurée par l'utilisateur (store persisté). */
export function getConfiguredSunsetTime(): string {
  if (typeof window === 'undefined') return DEFAULT_SUNSET_TIME;
  return normalizeSunsetTime(useSabbathStore.getState().sunsetTime);
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
