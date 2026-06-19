import {
  DEFAULT_SUNSET_TIME,
  getSunsetMinutesFromTime,
  parseClockToMinutes,
} from './sabbathTime.js';

export {
  DEFAULT_SUNSET_TIME,
  normalizeSunsetTime,
  formatSunsetDisplay,
  parseClockToMinutes,
} from './sabbathTime.js';

export interface PlanningDay {
  day: number;
  name: string;
}

export function getSunsetMinutes(sunsetTime?: string): number {
  return getSunsetMinutesFromTime(sunsetTime ?? DEFAULT_SUNSET_TIME);
}

export function toPlanningWeekday(date: Date): number {
  return date.getDay() === 0 ? 7 : date.getDay();
}

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

export function filterTimeBlocksForDay(
  blocks: TimeBlockSlot[],
  planningDay: number,
  sunsetTime?: string
): TimeBlockSlot[] {
  if (planningDay !== 5) return blocks;
  const sunset = getSunsetMinutes(sunsetTime);
  return blocks.filter((b) => parseClockToMinutes(b.end) <= sunset);
}
