import { create } from 'zustand';
import type { InAppReminder } from '../lib/reminders';

interface ReminderState {
  active: InAppReminder[];
  dismissed: Set<string>;
  setActive: (reminders: InAppReminder[]) => void;
  dismiss: (id: string) => void;
  clearDismissed: () => void;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  active: [],
  dismissed: new Set(),
  setActive: (reminders) => {
    const { dismissed } = get();
    set({ active: reminders.filter((r) => !dismissed.has(r.id)) });
  },
  dismiss: (id) => {
    const dismissed = new Set(get().dismissed);
    dismissed.add(id);
    set((s) => ({
      dismissed,
      active: s.active.filter((r) => r.id !== id),
    }));
  },
  clearDismissed: () => set({ dismissed: new Set() }),
}));
