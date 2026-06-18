import { Sparkles, Wand2, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Goal } from '../../types';
import { getScheduleInsights } from '../../lib/scheduleHealth';
import { shouldShowRecalculate } from '../../lib/trajectory';
import { useScheduleStore } from '../../store/useScheduleStore';
import { useStore } from '../../store/useStore';
import { FadeIn } from '../ui/SectionHeader';

interface AiCoachPanelProps {
  goals: Goal[];
}

export function AiCoachPanel({ goals }: AiCoachPanelProps) {
  const insights = useMemo(() => getScheduleInsights(goals), [goals]);
  const recalculate = useStore((s) => s.recalculateVisionTrajectory);
  const behindFlags = useScheduleStore((s) => s.behindVisions);
  const [recalculating, setRecalculating] = useState<string | null>(null);

  const visionsNeedingRecalc = useMemo(() => {
    return insights.filter((i) =>
      shouldShowRecalculate(goals, i.visionId, Boolean(behindFlags[i.visionId]))
    );
  }, [insights, goals, behindFlags]);

  if (insights.length === 0) return null;

  const handleRecalculate = async (visionId: string) => {
    setRecalculating(visionId);
    try {
      await recalculate(visionId);
    } finally {
      setRecalculating(null);
    }
  };

  return (
    <FadeIn delay={0.1}>
      <section className="ai-coach-panel">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-aw-warm flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5 text-aw-accent" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[11px] text-aw-accent uppercase tracking-[0.12em] mb-1">
              Coach IA · Rétro-planification
            </p>
            <h3 className="font-display text-lg leading-snug">Suivi de trajectoire</h3>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {insights.map((item) => (
            <div key={item.visionId} className="ai-coach-insight">
              <p className="text-[12px] font-medium truncate">{item.visionTitle}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-aw-faint">
                <span className="tabular-nums">Réel {item.actualProgress}%</span>
                <span>·</span>
                <span className="tabular-nums">Cible {item.expectedProgress}%</span>
                {item.behind && (
                  <span className="text-aw-accent tabular-nums ml-auto">−{item.gap}%</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {visionsNeedingRecalc.length > 0 ? (
          <div className="space-y-2 mb-4">
            {visionsNeedingRecalc.map((item) => (
              <button
                key={item.visionId}
                type="button"
                className="ai-coach-cta ai-coach-cta--active"
                disabled={recalculating === item.visionId}
                onClick={() => handleRecalculate(item.visionId)}
              >
                <RefreshCw
                  className={`w-4 h-4 ${recalculating === item.visionId ? 'animate-spin' : ''}`}
                />
                {recalculating === item.visionId
                  ? 'Recalcul en cours…'
                  : 'Recalculer la trajectoire par IA'}
              </button>
            ))}
            <p className="text-[10px] text-aw-faint leading-relaxed px-1">
              Réajuste les objectifs du mois, de la semaine et du jour sans modifier la vision à 2 ans.
            </p>
          </div>
        ) : (
          <p className="text-[12px] text-aw-muted mb-4">Planning aligné sur l'horizon 2 ans.</p>
        )}

        <div className="ai-coach-preview">
          <Sparkles className="w-4 h-4 text-aw-faint shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium">Rappels actifs</p>
            <p className="text-[10px] text-aw-faint mt-0.5 leading-relaxed">
              Brief du matin, alertes de blocs horaires et rappels de fin de mois/trimestre.
            </p>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
