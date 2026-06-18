/** Heure du coucher du soleil par défaut (HH:MM, heure locale). */
export const DEFAULT_SUNSET_TIME = '19:30';

export function normalizeSunsetTime(time: string): string {
  const trimmed = time.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return DEFAULT_SUNSET_TIME;
  const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
  const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseClockToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function formatSunsetDisplay(time: string): string {
  return normalizeSunsetTime(time).replace(':', 'h');
}

export function getSunsetMinutesFromTime(sunsetTime: string): number {
  return parseClockToMinutes(normalizeSunsetTime(sunsetTime));
}
