import { Sparkles, Wand2 } from 'lucide-react';
import { useMemo } from 'react';
import type { Goal } from '../../types';
import { getScheduleInsights } from '../../lib/scheduleHealth';
import { FadeIn } from '../ui/SectionHeader';

interface AiCoachPanelProps {
  goals: Goal[];
}

export function AiCoachPanel({ goals }: AiCoachPanelProps) {
  const insights = useMemo(() => getScheduleInsights(goals), [goals]);
  const delayed = insights.filter((i) => i.behind);

  if (insights.length === 0) return null;

  return (
    <FadeIn delay={0.1}>
      <section className="ai-coach-panel">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-aw-warm flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5 text-aw-accent" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[11px] text-aw-accent uppercase tracking-[0.12em] mb-1">
              Coach IA
            </p>
            <h3 className="font-display text-lg leading-snug">Ajustement automatique</h3>
          </div>
        </div>

        {delayed.length > 0 ? (
          <div className="space-y-3 mb-4">
            {delayed.map((item) => (
              <div key={item.visionId} className="ai-coach-insight">
                <p className="text-[12px] font-medium truncate">{item.visionTitle}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-aw-faint">
                  <span className="tabular-nums">Réel {item.actualProgress}%</span>
                  <span>·</span>
                  <span className="tabular-nums">Cible {item.expectedProgress}%</span>
                  <span className="text-aw-accent tabular-nums ml-auto">−{item.gap}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-aw-muted mb-4">Planning aligné sur l'horizon 2 ans.</p>
        )}

        <div className="ai-coach-preview">
          <Sparkles className="w-4 h-4 text-aw-faint shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium">Suggestions IA à venir</p>
            <p className="text-[10px] text-aw-faint mt-0.5 leading-relaxed">
              Recalibrage des jalons, répartition des tâches et alertes proactives en cas de retard.
            </p>
          </div>
        </div>

        <button type="button" className="ai-coach-cta" disabled>
          Activer l'ajustement IA
          <span className="ai-coach-badge">Bientôt</span>
        </button>
      </section>
    </FadeIn>
  );
}
