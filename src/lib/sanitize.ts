const MAX_TITLE = 200;
const MAX_DESCRIPTION = 2000;
const MAX_SWOT_FIELD = 1000;
const MAX_PERIOD_LABEL = 80;

export function clampText(value: string, max: number): string {
  return value.trim().slice(0, max);
}

export function sanitizeTitle(value: string): string {
  return clampText(value, MAX_TITLE);
}

export function sanitizeDescription(value: string): string {
  return clampText(value, MAX_DESCRIPTION);
}

export function sanitizeSwotField(value: string): string {
  return clampText(value, MAX_SWOT_FIELD);
}

export function sanitizePeriodLabel(value: string): string {
  return clampText(value, MAX_PERIOD_LABEL);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export const PASSWORD_HINT = '8 caractères minimum, avec lettres et chiffres.';
