import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EncouragementPing, PartnerActivity } from '../types/premium';
import type { SpaceType } from '../types';

const PARTNER: Record<'user_a' | 'user_b' | 'shared', 'user_a' | 'user_b' | 'shared' | null> = {
  user_a: 'user_b',
  user_b: 'user_a',
  shared: null,
};

interface PingState {
  pings: EncouragementPing[];
  partnerActivity: PartnerActivity | null;
  activeAnimation: EncouragementPing | null;

  recordPartnerCompletion: (space: SpaceType, taskTitle: string) => void;
  sendPing: (fromSpace: SpaceType, toSpace: SpaceType, taskTitle?: string) => void;
  consumePingsFor: (space: SpaceType) => EncouragementPing[];
  clearPartnerActivity: () => void;
  dismissAnimation: () => void;
  getPartnerSpace: (space: SpaceType) => SpaceType | null;
}

function newId() {
  return crypto.randomUUID();
}

export const usePingStore = create<PingState>()(
  persist(
    (set, get) => ({
      pings: [],
      partnerActivity: null,
      activeAnimation: null,

      getPartnerSpace: (space) => PARTNER[space],

      recordPartnerCompletion: (space, taskTitle) => {
        if (space === 'shared') return;
        set({
          partnerActivity: { space, taskTitle, at: new Date().toISOString() },
        });
      },

      sendPing: (fromSpace, toSpace, taskTitle) => {
        const ping: EncouragementPing = {
          id: newId(),
          fromSpace,
          toSpace,
          taskTitle,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((s) => ({
          pings: [...s.pings, ping],
          partnerActivity: null,
        }));
      },

      consumePingsFor: (space) => {
        const unread = get().pings.filter((p) => p.toSpace === space && !p.read);
        if (unread.length > 0) {
          const latest = unread[unread.length - 1];
          set((s) => ({
            pings: s.pings.map((p) =>
              p.toSpace === space && !p.read ? { ...p, read: true } : p
            ),
            activeAnimation: latest,
          }));
        }
        return unread;
      },

      clearPartnerActivity: () => set({ partnerActivity: null }),
      dismissAnimation: () => set({ activeAnimation: null }),
    }),
    { name: 'visiondual-pings' }
  )
);
