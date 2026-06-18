import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScheduleState {
  behindVisions: Record<string, boolean>;
  markBehind: (visionId: string, behind?: boolean) => void;
  isBehind: (visionId: string) => boolean;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      behindVisions: {},
      markBehind: (visionId, behind = true) =>
        set((s) => ({
          behindVisions: { ...s.behindVisions, [visionId]: behind },
        })),
      isBehind: (visionId) => Boolean(get().behindVisions[visionId]),
    }),
    { name: 'em-schedule-flags' }
  )
);
