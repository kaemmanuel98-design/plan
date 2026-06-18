import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PlanPreviewModal } from '../wizard/PlanPreviewModal';
import { useStore } from '../../store/useStore';
import type { DraftPlanItem } from '../../lib/planDraft';
import type { PlanSource } from '../../lib/aiPlanClient';
import { getChildren } from '../../lib/progress';
import type { Goal } from '../../types';

interface VisionPlanActionsProps {
  vision: Goal;
  allGoals: Goal[];
  variant?: 'banner' | 'button';
}

export function VisionPlanActions({ vision, allGoals, variant = 'banner' }: VisionPlanActionsProps) {
  const generatePlanDraftForVision = useStore((s) => s.generatePlanDraftForVision);
  const injectPlanIntoVision = useStore((s) => s.injectPlanIntoVision);
  const syncError = useStore((s) => s.syncError);

  const [generating, setGenerating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [planDraft, setPlanDraft] = useState<DraftPlanItem[]>([]);
  const [planSource, setPlanSource] = useState<PlanSource>('smart');

  const hasPlan = getChildren(allGoals, vision.id).length > 0;

  if (hasPlan) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generatePlanDraftForVision(vision.id);
      if (result.draft.items.length === 0) {
        useStore.setState({ syncError: 'Aucun objectif généré. Réessayez.' });
        return;
      }
      setPlanDraft(result.draft.items);
      setPlanSource(result.source);
      setPreviewOpen(true);
    } catch (err) {
      useStore.setState({
        syncError: err instanceof Error ? err.message : 'Erreur lors de la génération du plan',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleValidate = async (items: DraftPlanItem[]) => {
    setCommitting(true);
    try {
      await injectPlanIntoVision(vision.id, items);
      setPreviewOpen(false);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className="mx-6 mb-4 rounded-xl border border-aw-line p-4" style={{ backgroundColor: 'var(--aw-warm)' }}>
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-aw-accent" />
            Plan d&apos;action IA non généré
          </p>
          <p className="text-[11px] text-aw-muted mt-2 leading-relaxed">
            Cette vision n&apos;a pas encore d&apos;objectifs annuels, mensuels et quotidiens.
            Lancez la génération IA pour peupler toute la cascade.
          </p>
          {syncError && (
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-2">{syncError}</p>
          )}
          <button
            type="button"
            className="btn-primary w-full mt-3 !py-2.5 text-sm"
            disabled={generating}
            onClick={handleGenerate}
          >
            {generating ? 'Génération en cours…' : 'Générer le plan d\'action par IA'}
            {!generating && <Sparkles className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn-primary w-full !py-2.5 text-sm"
          disabled={generating}
          onClick={handleGenerate}
        >
          {generating ? 'Génération…' : 'Générer le plan par IA'}
          {!generating && <Sparkles className="w-4 h-4" />}
        </button>
      )}

      <PlanPreviewModal
        open={previewOpen}
        items={planDraft}
        source={planSource}
        loading={committing}
        onClose={() => setPreviewOpen(false)}
        onValidate={handleValidate}
      />
    </>
  );
}
