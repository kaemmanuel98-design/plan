import { Sparkles, Wand2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMemo, useState, useRef } from 'react';
import type { Goal } from '../../types';
import { getScheduleInsights } from '../../lib/scheduleHealth';
import { useStore } from '../../store/useStore';
import { useToastStore } from '../../store/useToastStore';
import { FadeIn } from '../ui/SectionHeader';

interface AiCoachPanelProps {
  goals: Goal[];
}

export function AiCoachPanel({ goals }: AiCoachPanelProps) {
  const insights = useMemo(() => getScheduleInsights(goals), [goals]);
  const recalculate = useStore((s) => s.recalculateVisionTrajectory);
  const showToast = useToastStore((s) => s.show);
  const [recalculating, setRecalculating] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err' | 'info'; text: string } | null>(
    null
  );
  const panelRef = useRef<HTMLElement>(null);

  if (insights.length === 0) return null;

  const handleRecalculate = async (visionId: string, visionTitle: string) => {
    setRecalculating(visionId);
    setFeedback({ type: 'info', text: `Recalcul de « ${visionTitle} » en cours…` });
    showToast(`Recalcul « ${visionTitle} »…`, 'info');

    try {
      const result = await recalculate(visionId);
      setFeedback({ type: result.ok ? 'ok' : 'err', text: result.message });
      if (result.ok && result.added > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Erreur inattendue lors du recalcul';
      setFeedback({ type: 'err', text });
      showToast(text, 'err');
    } finally {
      setRecalculating(null);
    }
  };

  return (
    <FadeIn delay={0.1}>
      <section ref={panelRef} className="ai-coach-panel">
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
              <button
                type="button"
                className="ai-coach-cta ai-coach-cta--active mt-3"
                disabled={recalculating !== null}
                onClick={() => handleRecalculate(item.visionId, item.visionTitle)}
              >
                <RefreshCw
                  className={`w-4 h-4 ${recalculating === item.visionId ? 'animate-spin' : ''}`}
                />
                {recalculating === item.visionId
                  ? 'Recalcul en cours…'
                  : 'Recalculer la trajectoire par IA'}
              </button>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-aw-faint leading-relaxed px-1 mb-4">
          Réajuste semaine, jour et blocs horaires du mois en cours — sans toucher à la vision 2 ans.
        </p>

        {feedback && (
          <div
            className={`flex items-start gap-2 rounded-lg px-3 py-2.5 mb-4 text-[11px] leading-relaxed ${
              feedback.type === 'ok'
                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                : feedback.type === 'info'
                  ? 'bg-sky-500/10 text-sky-800 dark:text-sky-200'
                  : 'bg-amber-500/10 text-amber-800 dark:text-amber-200'
            }`}
          >
            {feedback.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : feedback.type === 'info' ? (
              <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.text}</span>
          </div>
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
