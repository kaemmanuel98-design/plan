import type { GoalLevel } from '../types/index.js';
import {
  DEFAULT_TIME_BLOCKS,
  filterTimeBlocksForDay,
  getWeeklyPlanningDays,
  shouldGenerateTimeBlocksForDay,
  toPlanningWeekday,
} from './sabbathCore.js';

export interface CascadePathNode {
  path: string;
  parentPath: string | null;
  level: GoalLevel;
  periodLabel: string;
  year: number;
  semester: number;
  quarterInSem: number;
  monthInQuarter: number;
  weekInMonth?: number;
  dayInWeek?: number;
  calendarLabel?: string;
}

export interface HorizonPosition {
  year: number;
  semester: number;
  quarterInSem: number;
  monthInQuarter: number;
  weekInMonth: number;
  weekday: number;
  monthsFromStart: number;
  monthPath: string;
  weekPath: string;
  dayPath: string;
}

const HORIZON_MONTHS = 24;

export function getVisionEndDate(startDate: Date): Date {
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + HORIZON_MONTHS);
  return end;
}

export function formatCountdown(startDate: string | Date, now = new Date()): string {
  const start = new Date(startDate);
  const end = getVisionEndDate(start);
  const ms = end.getTime() - now.getTime();
  if (ms <= 0) return 'Horizon 2 ans atteint';

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30.44);
  const remDays = days - Math.floor(months * 30.44);

  if (months > 0) {
    return `Il reste ${months} mois et ${remDays} jour${remDays > 1 ? 's' : ''}`;
  }
  return `Il reste ${days} jour${days > 1 ? 's' : ''}`;
}

export function getHorizonPosition(startDate: Date, now = new Date()): HorizonPosition {
  const monthsFromStart = Math.max(
    0,
    Math.min(
      HORIZON_MONTHS - 1,
      (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
    )
  );

  const year = monthsFromStart < 12 ? 1 : 2;
  const monthInYear = monthsFromStart % 12;
  const semester = monthInYear < 6 ? 1 : 2;
  const monthInSemester = monthInYear % 6;
  const quarterInSem = monthInSemester < 3 ? 1 : 2;
  const monthInQuarter = (monthInSemester % 3) + 1;
  const weekInMonth = Math.min(4, Math.max(1, Math.ceil(now.getDate() / 7)));
  const weekday = toPlanningWeekday(now);

  const monthPath = `${year}.${semester}.${quarterInSem}.${monthInQuarter}`;
  const weekPath = `${monthPath}.w${weekInMonth}`;
  const dayPath = `${weekPath}.d${weekday}`;

  return {
    year,
    semester,
    quarterInSem,
    monthInQuarter,
    weekInMonth,
    weekday,
    monthsFromStart,
    monthPath,
    weekPath,
    dayPath,
  };
}

function calendarMonthLabel(startDate: Date, monthsFromStart: number): string {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + monthsFromStart);
  const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Rétro-planification : structure complète + tactique uniquement sur mois/semaine/jour en cours. */
export function enumerateRetroCascadePaths(
  startDate: Date = new Date(),
  now: Date = new Date()
): CascadePathNode[] {
  const nodes: CascadePathNode[] = [];
  const pos = getHorizonPosition(startDate, now);
  let globalMonth = 0;

  for (const year of [1, 2] as const) {
    const yPath = String(year);
    nodes.push({
      path: yPath,
      parentPath: null,
      level: 'annual',
      periodLabel: `An ${year}`,
      year,
      semester: 0,
      quarterInSem: 0,
      monthInQuarter: 0,
    });

    for (const semester of [1, 2] as const) {
      const sPath = `${year}.${semester}`;
      nodes.push({
        path: sPath,
        parentPath: yPath,
        level: 'semester',
        periodLabel: `An ${year} · S${semester}`,
        year,
        semester,
        quarterInSem: 0,
        monthInQuarter: 0,
      });

      for (const quarterInSem of [1, 2] as const) {
        const quarterIndex = (year - 1) * 4 + (semester - 1) * 2 + quarterInSem;
        const qPath = `${sPath}.${quarterInSem}`;
        nodes.push({
          path: qPath,
          parentPath: sPath,
          level: 'quarterly',
          periodLabel: `T${quarterIndex}`,
          year,
          semester,
          quarterInSem,
          monthInQuarter: 0,
        });

        for (const monthInQuarter of [1, 2, 3] as const) {
          const mPath = `${qPath}.${monthInQuarter}`;
          const calLabel = calendarMonthLabel(startDate, globalMonth);
          nodes.push({
            path: mPath,
            parentPath: qPath,
            level: 'monthly',
            periodLabel: calLabel,
            year,
            semester,
            quarterInSem,
            monthInQuarter,
            calendarLabel: calLabel,
          });
          globalMonth++;

          const isCurrentMonth =
            year === pos.year &&
            semester === pos.semester &&
            quarterInSem === pos.quarterInSem &&
            monthInQuarter === pos.monthInQuarter;

          if (isCurrentMonth) {
            for (let week = 1; week <= 4; week++) {
              const wPath = `${mPath}.w${week}`;
              nodes.push({
                path: wPath,
                parentPath: mPath,
                level: 'weekly',
                periodLabel: `${calLabel} · Semaine ${week}`,
                year,
                semester,
                quarterInSem,
                monthInQuarter,
                weekInMonth: week,
              });

              if (week === pos.weekInMonth) {
                for (const { day, name } of getWeeklyPlanningDays()) {
                  const dPath = `${wPath}.d${day}`;
                  nodes.push({
                    path: dPath,
                    parentPath: wPath,
                    level: 'daily',
                    periodLabel: `${name} — Quotidien`,
                    year,
                    semester,
                    quarterInSem,
                    monthInQuarter,
                    weekInMonth: week,
                    dayInWeek: day,
                  });

                  if (shouldGenerateTimeBlocksForDay(day, now)) {
                    const blocks = filterTimeBlocksForDay(DEFAULT_TIME_BLOCKS, day);
                    blocks.forEach((b, i) => {
                      nodes.push({
                        path: `${dPath}.tb${i + 1}`,
                        parentPath: dPath,
                        level: 'time_block',
                        periodLabel: `${b.start}–${b.end}`,
                        year,
                        semester,
                        quarterInSem,
                        monthInQuarter,
                        weekInMonth: week,
                        dayInWeek: day,
                        calendarLabel: `${b.start}–${b.end} : ${b.suffix}`,
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

export function isTacticalLevel(level: GoalLevel): boolean {
  return level === 'weekly' || level === 'daily' || level === 'time_block';
}

export const RETRO_PATHS = enumerateRetroCascadePaths();
