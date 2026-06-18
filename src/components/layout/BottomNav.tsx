import { motion } from 'framer-motion';
import type { SpaceType } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import { useAuthStore, isSpaceAllowed } from '../../store/useAuthStore';
import { IconCouple, IconMadame, IconMonsieur } from '../brand/AppIcons';

const TABS: { id: SpaceType; label: string; Icon: typeof IconMonsieur }[] = [
  { id: 'user_a', label: 'Monsieur', Icon: IconMonsieur },
  { id: 'shared', label: 'Couple', Icon: IconCouple },
  { id: 'user_b', label: 'Madame', Icon: IconMadame },
];

export function BottomNav() {
  const currentSpace = useStore((s) => s.currentSpace);
  const setCurrentSpace = useStore((s) => s.setCurrentSpace);
  const getRootVisions = useStore((s) => s.getRootVisions);
  const profile = useAuthStore((s) => s.profile);

  const userSpace = profile?.spaceType;

  return (
    <nav className="tab-bar safe-bottom" aria-label="Espaces">
      <div className="flex items-center justify-around h-[52px] px-6">
        {TABS.map((tab) => {
          const Icon = tab.Icon;
          const active = currentSpace === tab.id;
          const count = getRootVisions(tab.id).length;
          const locked =
            isSupabaseConfigured &&
            userSpace &&
            !isSpaceAllowed(userSpace, tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => !locked && setCurrentSpace(tab.id)}
              disabled={locked}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                locked ? 'opacity-25 cursor-not-allowed' : active ? 'text-aw-black' : 'text-aw-faint'
              }`}
            >
              {active && !locked && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'var(--aw-warm)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <div className="relative">
                <Icon active={active && !locked} className="w-5 h-5" />
                {count > 0 && !active && !locked && (
                  <span
                    className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--aw-accent)' }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
