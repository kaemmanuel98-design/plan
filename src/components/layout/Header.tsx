import { motion } from 'framer-motion';
import type { SpaceType } from '../../types';
import { useStore } from '../../store/useStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Plus } from 'lucide-react';

const SPACES: { id: SpaceType; label: string }[] = [
  { id: 'user_a', label: 'Monsieur' },
  { id: 'user_b', label: 'Madame' },
  { id: 'shared', label: 'Couple' },
];

export function Header() {
  const currentSpace = useStore((s) => s.currentSpace);
  const setCurrentSpace = useStore((s) => s.setCurrentSpace);
  const openWizard = useStore((s) => s.openWizard);
  const isConnected = useStore((s) => s.isConnected);
  const isLoading = useStore((s) => s.isLoading);

  return (
    <header className="sticky top-0 z-40 bg-aw-bg/80 backdrop-blur-xl border-b border-aw-line">
      <div className="aw-container">
        <div className="flex items-center justify-between h-16 md:h-[72px] gap-6">
          <button
            onClick={() => setCurrentSpace('shared')}
            className="flex items-baseline gap-0.5 shrink-0 group"
          >
            <span className="font-display text-2xl md:text-[1.65rem] text-aw-black group-hover:opacity-70 transition-opacity">
              Vision
            </span>
            <span className="font-display text-2xl md:text-[1.65rem] italic text-aw-accent">
              Dual
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {SPACES.map((space) => {
              const active = currentSpace === space.id;
              return (
                <button
                  key={space.id}
                  onClick={() => setCurrentSpace(space.id)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    active ? 'text-aw-black' : 'text-aw-muted hover:text-aw-black'
                  }`}
                >
                  {space.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-4 right-4 h-px bg-aw-black"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {isSupabaseConfigured && (
              <span
                className="hidden sm:flex items-center gap-2 text-[11px] text-aw-faint uppercase tracking-wider"
                title={isConnected ? 'Supabase connecté' : isLoading ? 'Connexion…' : 'Hors ligne'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? 'bg-aw-accent' : isLoading ? 'bg-amber-400 animate-pulse' : 'bg-aw-faint'
                  }`}
                />
                {isConnected ? 'Live' : isLoading ? 'Sync' : 'Off'}
              </span>
            )}
            <button className="btn-primary !py-2.5 !px-5 text-xs md:text-sm" onClick={openWizard}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle vision</span>
              <span className="sm:hidden">Créer</span>
            </button>
          </div>
        </div>

        <nav className="flex md:hidden items-center gap-1 pb-3 -mt-1 overflow-x-auto">
          {SPACES.map((space) => {
            const active = currentSpace === space.id;
            return (
              <button
                key={space.id}
                onClick={() => setCurrentSpace(space.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'bg-aw-black text-white'
                    : 'bg-aw-white border border-aw-line text-aw-muted'
                }`}
              >
                {space.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
