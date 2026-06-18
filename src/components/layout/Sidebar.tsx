import type { SpaceType } from '../../types';
import { useStore } from '../../store/useStore';
import { User, UserCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const SPACES: { id: SpaceType; label: string; subtitle: string; icon: typeof User }[] = [
  { id: 'user_a', label: 'Monsieur', subtitle: 'Espace privé', icon: User },
  { id: 'user_b', label: 'Madame', subtitle: 'Espace privé', icon: UserCircle },
  { id: 'shared', label: 'Couple', subtitle: 'Vision commune', icon: Users },
];

export function Sidebar() {
  const currentSpace = useStore((s) => s.currentSpace);
  const setCurrentSpace = useStore((s) => s.setCurrentSpace);
  const getRootVisions = useStore((s) => s.getRootVisions);

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full border-r border-white/[0.06] bg-surface-elevated/50">
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center">
            <span className="text-white font-bold text-sm">VD</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight">E<span className="text-aw-accent">&</span>M</h1>
            <p className="text-[11px] text-white/40">Planification à 2 ans</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Espaces
        </p>
        {SPACES.map((space) => {
          const Icon = space.icon;
          const isActive = currentSpace === space.id;
          const visionCount = getRootVisions(space.id).length;

          return (
            <button
              key={space.id}
              onClick={() => setCurrentSpace(space.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/[0.08] rounded-xl border border-white/[0.06]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`relative w-4 h-4 ${isActive ? 'text-accent' : ''}`} />
              <div className="relative flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{space.label}</p>
                <p className="text-[11px] text-white/30 truncate">{space.subtitle}</p>
              </div>
              {visionCount > 0 && (
                <span className="relative text-[10px] bg-white/[0.08] text-white/50 px-1.5 py-0.5 rounded-md tabular-nums">
                  {visionCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="glass-panel p-3">
          <p className="text-[11px] text-white/40 leading-relaxed">
            Cascade convergente sur 8 niveaux — de la vision globale aux actions horaires.
          </p>
        </div>
      </div>
    </aside>
  );
}
