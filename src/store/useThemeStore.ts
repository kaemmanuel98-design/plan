import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResolvedTheme, ThemeMode } from '../types/premium';

interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
  syncResolved: () => void;
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const hour = new Date().getHours();
  const evening = hour >= 19 || hour < 7;
  return prefersDark || evening ? 'dark' : 'light';
}

export function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#141413' : '#faf8f5');
}

export function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'auto';
  try {
    const raw = localStorage.getItem('visiondual-theme');
    if (!raw) return 'auto';
    const parsed = JSON.parse(raw) as { state?: { mode?: ThemeMode; theme?: ResolvedTheme } };
    if (parsed.state?.mode) return parsed.state.mode;
    return parsed.state?.theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'auto';
  }
}

const initialMode = typeof window !== 'undefined' ? getInitialMode() : 'auto';
const initialResolved =
  typeof window !== 'undefined' ? resolveTheme(initialMode) : 'light';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: initialMode,
      resolved: initialResolved,
      setMode: (mode) => {
        const resolved = resolveTheme(mode);
        applyTheme(resolved);
        set({ mode, resolved });
      },
      cycleMode: () => {
        const order: ThemeMode[] = ['light', 'dark', 'auto'];
        const idx = order.indexOf(get().mode);
        get().setMode(order[(idx + 1) % order.length]);
      },
      syncResolved: () => {
        const resolved = resolveTheme(get().mode);
        applyTheme(resolved);
        set({ resolved });
      },
    }),
    {
      name: 'visiondual-theme',
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.mode);
          applyTheme(resolved);
          state.resolved = resolved;
        }
      },
    }
  )
);

export function setupAutoThemeListener() {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    const { mode, syncResolved } = useThemeStore.getState();
    if (mode === 'auto') syncResolved();
  };
  media.addEventListener('change', onChange);

  const hourTimer = window.setInterval(() => {
    const { mode, syncResolved } = useThemeStore.getState();
    if (mode === 'auto') syncResolved();
  }, 60_000);

  return () => {
    media.removeEventListener('change', onChange);
    window.clearInterval(hourTimer);
  };
}
