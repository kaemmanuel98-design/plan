import { useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useReminderStore } from '../store/useReminderStore';
import { useScheduleStore } from '../store/useScheduleStore';
import { useSabbathStore } from '../store/useSabbathStore';
import { shouldShowRecalculate } from '../lib/trajectory';
import {
  collectReminders,
  notifyIfNew,
  requestNotificationPermission,
  resetDailyNotifications,
} from '../lib/reminders';

export function useReminders() {
  const goals = useStore((s) => s.goals);
  const currentSpace = useStore((s) => s.currentSpace);
  const behindFlags = useScheduleStore((s) => s.behindVisions);
  const sunsetTime = useSabbathStore((s) => s.sunsetTime);
  const setActive = useReminderStore((s) => s.setActive);

  const behindVisionIds = useMemo(() => {
    return goals
      .filter((g) => g.level === 'global_vision')
      .filter((v) => shouldShowRecalculate(goals, v.id, Boolean(behindFlags[v.id])))
      .map((v) => v.id);
  }, [goals, behindFlags]);

  useEffect(() => {
    void requestNotificationPermission();
  }, []);

  useEffect(() => {
    const tick = () => {
      resetDailyNotifications();
      const reminders = collectReminders(goals, currentSpace, behindVisionIds);
      setActive(reminders);
      for (const r of reminders) {
        notifyIfNew(r);
      }
    };

    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [goals, currentSpace, behindVisionIds, sunsetTime, setActive]);
}
