import type { Goal, SpaceType } from '../types';
import { getDescendants, getChildren, calculateProgress } from './progress';
import { isDuringShabbat } from './sabbath';

export type ReminderKind = 'time_block' | 'morning_brief' | 'period_end' | 'trajectory';

export interface InAppReminder {
  id: string;
  kind: ReminderKind;
  title: string;
  body: string;
  urgency: 'low' | 'medium' | 'high';
  createdAt: number;
}

const MORNING_HOUR = 7;
const PERIOD_END_DAYS = 3;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function nowMinutes(): number {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function isNearPeriodEnd(now = new Date()): 'month' | 'quarter' | null {
  const day = now.getDate();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  if (lastDay - day < PERIOD_END_DAYS) {
    const month = now.getMonth();
    if ([2, 5, 8, 11].includes(month) && lastDay - day < PERIOD_END_DAYS) {
      return 'quarter';
    }
    return 'month';
  }
  return null;
}

export function buildMorningBrief(goals: Goal[], space: SpaceType): string | null {
  if (isDuringShabbat()) return null;

  const hour = new Date().getHours();
  if (hour < MORNING_HOUR || hour > 10) return null;

  const spaceGoals = goals.filter((g) => g.spaceType === space);
  const personalDaily = spaceGoals.filter((g) => g.level === 'daily' && !g.completed).length;
  const sharedDaily = goals.filter((g) => g.spaceType === 'shared' && g.level === 'daily' && !g.completed).length;

  if (personalDaily === 0 && sharedDaily === 0) return null;

  const parts: string[] = [];
  if (personalDaily > 0) {
    parts.push(`${personalDaily} action${personalDaily > 1 ? 's' : ''} importante${personalDaily > 1 ? 's' : ''} de ton espace`);
  }
  if (sharedDaily > 0) {
    parts.push(`${sharedDaily} action commune`);
  }

  return `Aujourd'hui, ${parts.join(' et ')} t'attendent pour rester aligné sur tes 2 ans.`;
}

export function findActiveTimeBlock(goals: Goal[], space: SpaceType): Goal | null {
  if (isDuringShabbat()) return null;

  const now = nowMinutes();
  const blocks = goals.filter(
    (g) =>
      g.spaceType === space &&
      g.level === 'time_block' &&
      !g.completed &&
      g.startTime &&
      g.endTime
  );

  for (const block of blocks) {
    const start = parseTime(block.startTime!);
    const end = parseTime(block.endTime!);
    if (now >= start - 5 && now <= end) {
      return block;
    }
  }
  return null;
}

export function findUpcomingTimeBlock(goals: Goal[], space: SpaceType): Goal | null {
  if (isDuringShabbat()) return null;

  const now = nowMinutes();
  const blocks = goals
    .filter(
      (g) =>
        g.spaceType === space &&
        g.level === 'time_block' &&
        !g.completed &&
        g.startTime &&
        parseTime(g.startTime) > now &&
        parseTime(g.startTime) - now <= 30
    )
    .sort((a, b) => parseTime(a.startTime!) - parseTime(b.startTime!));

  return blocks[0] ?? null;
}

export function buildPeriodEndAlerts(goals: Goal[]): InAppReminder[] {
  const period = isNearPeriodEnd();
  if (!period) return [];

  const visions = goals.filter((g) => g.level === 'global_vision');
  const alerts: InAppReminder[] = [];

  for (const vision of visions) {
    const descendants = getDescendants(goals, vision.id);
    const targets = descendants.filter((g) =>
      period === 'quarter' ? g.level === 'quarterly' : g.level === 'monthly'
    );
    const incomplete = targets.filter((g) => !g.completed && calculateProgress(goals, g.id) < 100);

    for (const goal of incomplete) {
      alerts.push({
        id: `period-${goal.id}-${todayKey()}`,
        kind: 'period_end',
        title: period === 'quarter' ? 'Fin de trimestre proche' : 'Fin de mois proche',
        body: `« ${goal.title} » n'est pas encore complété à 100 %. Faites le point à deux.`,
        urgency: 'high',
        createdAt: Date.now(),
      });
    }
  }

  return alerts;
}

export function collectReminders(
  goals: Goal[],
  space: SpaceType,
  behindVisionIds: string[] = []
): InAppReminder[] {
  const reminders: InAppReminder[] = [];
  const key = todayKey();

  if (isDuringShabbat()) {
    return reminders;
  }

  for (const visionId of behindVisionIds) {
    const vision = goals.find((g) => g.id === visionId);
    if (vision) {
      reminders.push({
        id: `trajectory-${visionId}-${key}`,
        kind: 'trajectory',
        title: 'Trajectoire à réajuster',
        body: `« ${vision.title} » est en retard. Recalculez la trajectoire par IA.`,
        urgency: 'high',
        createdAt: Date.now(),
      });
    }
  }

  const morning = buildMorningBrief(goals, space);
  if (morning) {
    reminders.push({
      id: `morning-${space}-${key}`,
      kind: 'morning_brief',
      title: 'Brief du matin',
      body: morning,
      urgency: 'medium',
      createdAt: Date.now(),
    });
  }

  const active = findActiveTimeBlock(goals, space);
  if (active) {
    reminders.push({
      id: `block-active-${active.id}`,
      kind: 'time_block',
      title: "C'est l'heure !",
      body: active.title,
      urgency: 'high',
      createdAt: Date.now(),
    });
  } else {
    const upcoming = findUpcomingTimeBlock(goals, space);
    if (upcoming) {
      reminders.push({
        id: `block-soon-${upcoming.id}`,
        kind: 'time_block',
        title: 'Bloc horaire dans 30 min',
        body: upcoming.title,
        urgency: 'medium',
        createdAt: Date.now(),
      });
    }
  }

  reminders.push(...buildPeriodEndAlerts(goals));
  return reminders;
}

export function showBrowserNotification(title: string, body: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, tag: `em-${title.slice(0, 20)}` });
  } catch {
    /* ignore */
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

const notifiedIds = new Set<string>();

export function notifyIfNew(reminder: InAppReminder) {
  if (notifiedIds.has(reminder.id)) return;
  notifiedIds.add(reminder.id);
  if (reminder.urgency === 'high' || reminder.kind === 'morning_brief') {
    showBrowserNotification(reminder.title, reminder.body);
  }
}

export function resetDailyNotifications() {
  const key = todayKey();
  for (const id of [...notifiedIds]) {
    if (!id.includes(key)) notifiedIds.delete(id);
  }
}

export function countIncompleteDailies(goals: Goal[], space: SpaceType): number {
  return goals.filter((g) => g.spaceType === space && g.level === 'daily' && !g.completed).length;
}

export function getParentPeriodGoals(goals: Goal[], visionId: string) {
  const descendants = getDescendants(goals, visionId);
  return {
    monthly: descendants.filter((g) => g.level === 'monthly'),
    quarterly: descendants.filter((g) => g.level === 'quarterly'),
  };
}

export function getChildrenGoals(goals: Goal[], parentId: string): Goal[] {
  return getChildren(goals, parentId);
}
