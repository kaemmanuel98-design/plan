import { LogOut } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { ThemeToggle } from '../ui/ThemeToggle';
import { SabbathSettingsButton } from '../settings/SabbathSettingsButton';
import { NotificationSettingsButton } from '../settings/NotificationSettingsButton';
import { EmLogo } from '../brand/EmLogo';
import { IconFocus, IconHome, IconMatrix } from '../brand/AppIcons';
import type { AppView } from '../../types/premium';
import type { SpaceType } from '../../types';

const SPACE_META: Record<SpaceType, string> = {
  user_a: 'Monsieur',
  user_b: 'Madame',
  shared: 'Couple',
};

const VIEWS: { id: AppView; label: string; Icon: typeof IconHome }[] = [
  { id: 'home', label: 'Accueil', Icon: IconHome },
  { id: 'focus', label: 'Focus', Icon: IconFocus },
  { id: 'eisenhower', label: 'Eisenhower', Icon: IconMatrix },
];

export function MobileTopBar() {
  const currentSpace = useStore((s) => s.currentSpace);
  const currentView = useStore((s) => s.currentView);
  const setCurrentView = useStore((s) => s.setCurrentView);
  const isConnected = useStore((s) => s.isConnected);
  const isLoading = useStore((s) => s.isLoading);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <header
      className="safe-top sticky top-0 z-40 transition-colors duration-300"
      style={{ backgroundColor: 'color-mix(in srgb, var(--aw-bg) 92%, transparent)' }}
    >
      <div className="mobile-container flex items-center justify-between py-3.5 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <EmLogo className="shrink-0" />
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--aw-warm)' }}
          >
            {VIEWS.map(({ id, label, Icon }) => {
              const active = currentView === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCurrentView(id)}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    active ? 'bg-aw-white shadow-sm text-aw-black' : 'text-aw-faint'
                  }`}
                >
                  <Icon active={active} className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isSupabaseConfigured && (
            <span
              className={`w-1 h-1 rounded-full shrink-0 mr-1 ${
                isConnected ? 'bg-aw-accent' : isLoading ? 'bg-amber-500 animate-pulse' : 'bg-aw-faint'
              }`}
            />
          )}
          {profile && (
            <span className="text-[10px] text-aw-faint truncate max-w-[4rem] hidden xs:inline">
              {profile.displayName}
            </span>
          )}
          <span className="text-[11px] text-aw-faint tracking-wide mr-1">
            {SPACE_META[currentSpace]}
          </span>
          {isSupabaseConfigured && profile && (
            <button
              type="button"
              onClick={() => signOut()}
              aria-label="Déconnexion"
              className="w-8 h-8 rounded-full flex items-center justify-center text-aw-faint hover:text-aw-black transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
          <NotificationSettingsButton />
          <SabbathSettingsButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
