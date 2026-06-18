import type { Goal } from '../../types';
import { getCascadeLevelStats } from '../../lib/visionCascade';
import { getLevelLabel } from '../../lib/progress';

interface PlanningCascadeProps {
  vision: Goal;
  allGoals: Goal[];
}

export function PlanningCascade({ vision, allGoals }: PlanningCascadeProps) {
  const stats = getCascadeLevelStats(allGoals, vision.id);
  const hasCascade = stats.some((s) => s.total > 0);

  if (!hasCascade) return null;

  return (
    <div className="px-6 pb-6 pt-0">
      <p className="text-[10px] text-aw-faint tracking-[0.12em] uppercase mb-3">
        Planification 2 ans — évolution par niveau
      </p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {stats.map(({ level, label, total, percent }) => (
          <div
            key={level}
            className="rounded-xl px-2 py-2.5 text-center"
            style={{ backgroundColor: 'var(--aw-warm)' }}
            title={getLevelLabel(level)}
          >
            <p className="text-[9px] text-aw-faint uppercase tracking-wide">{label}</p>
            <p className="text-sm font-medium tabular-nums mt-0.5">{percent}%</p>
            <p className="text-[9px] text-aw-faint mt-0.5">{total} obj.</p>
          </div>
        ))}
      </div>
        <p className="text-[10px] text-aw-faint mt-3 leading-relaxed">
          Rétro-planification sur 2 ans : structure complète + actions tactiques du mois en cours.
          Modifiez chaque étape ou recalculez la trajectoire si vous prenez du retard.
        </p>
    </div>
  );
}
