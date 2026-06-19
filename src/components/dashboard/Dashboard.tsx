import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useRootVisions, useSpaceGoals } from '../../hooks/useSpaceGoals';
import { VisionPlanActions } from '../vision/VisionPlanActions';
import { AiCoachPanel } from '../ai/AiCoachPanel';
import { TodayFocus, CompactEmpty } from './TodayFocus';
import { FadeIn } from '../ui/SectionHeader';
import type { SpaceType } from '../../types';

const SPACE_GREETING: Record<SpaceType, string> = {
  user_a: 'Votre horizon',
  user_b: 'Votre horizon',
  shared: 'À deux',
};

export function Dashboard() {
  const currentSpace = useStore((s) => s.currentSpace);
  const goals = useSpaceGoals(currentSpace);
  const rootVisions = useRootVisions(currentSpace);
  const openWizard = useStore((s) => s.openWizard);
  const syncError = useStore((s) => s.syncError);

  const featuredVision = rootVisions[0];
  const dateLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }, []);

  return (
    <div className="mobile-container pt-2 pb-6 space-y-6">
      {syncError && (
        <p className="text-[11px] text-amber-700 dark:text-amber-300 text-center px-4">
          {syncError}
        </p>
      )}

      <FadeIn>
        <p className="text-[11px] text-aw-faint tracking-[0.2em] uppercase mb-1">
          {SPACE_GREETING[currentSpace]}
        </p>
        <h1 className="aw-display text-[1.75rem] capitalize leading-tight">{dateLabel}</h1>
      </FadeIn>

      {featuredVision ? (
        <>
          {rootVisions.length > 1 && (
            <FadeIn delay={0.02}>
              <p className="text-[10px] text-aw-faint text-center">
                {rootVisions.length} visions — focus sur « {featuredVision.title.slice(0, 40)}
                {featuredVision.title.length > 40 ? '…' : ''} »
              </p>
            </FadeIn>
          )}
          <VisionPlanActions vision={featuredVision} allGoals={goals} />
          <TodayFocus vision={featuredVision} allGoals={goals} />
        </>
      ) : (
        <FadeIn delay={0.04}>
          <CompactEmpty onCreate={openWizard} />
        </FadeIn>
      )}

      {rootVisions.length > 0 && <AiCoachPanel goals={goals} />}
    </div>
  );
}
