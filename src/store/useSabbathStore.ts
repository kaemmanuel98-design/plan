import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SUNSET_TIME, normalizeSunsetTime } from '../lib/sabbathTime';

export interface SunsetPreset {
  id: string;
  label: string;
  time: string;
}

export const SUNSET_PRESETS: SunsetPreset[] = [
  { id: 'paris-winter', label: 'Paris · hiver', time: '17:15' },
  { id: 'paris-spring', label: 'Paris · printemps', time: '19:30' },
  { id: 'paris-summer', label: 'Paris · été', time: '21:45' },
  { id: 'lyon', label: 'Lyon · moyenne', time: '19:00' },
  { id: 'marseille', label: 'Marseille · été', time: '20:30' },
  { id: 'jerusalem-winter', label: 'Jérusalem · hiver', time: '16:45' },
  { id: 'jerusalem-summer', label: 'Jérusalem · été', time: '19:45' },
];

interface SabbathState {
  sunsetTime: string;
  presetId: string | null;
  setSunsetTime: (time: string) => void;
  applyPreset: (presetId: string) => void;
  resetSunsetTime: () => void;
}

export const useSabbathStore = create<SabbathState>()(
  persist(
    (set) => ({
      sunsetTime: DEFAULT_SUNSET_TIME,
      presetId: 'paris-spring',
      setSunsetTime: (time) =>
        set({
          sunsetTime: normalizeSunsetTime(time),
          presetId: null,
        }),
      applyPreset: (presetId) => {
        const preset = SUNSET_PRESETS.find((p) => p.id === presetId);
        if (!preset) return;
        set({ sunsetTime: preset.time, presetId });
      },
      resetSunsetTime: () =>
        set({ sunsetTime: DEFAULT_SUNSET_TIME, presetId: 'paris-spring' }),
    }),
    { name: 'em-sabbath-settings' }
  )
);
