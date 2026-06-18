import { Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useRootVisions, useSpaceGoals } from '../../hooks/useSpaceGoals';
import { GoalNode, DailyTodo } from './GoalTree';
import { VisionHero } from './VisionHero';
import { PillarEvolutionChart } from './PillarEvolutionChart';
import { FinanceGauges } from './FinanceGauges';
import { SwotMatrix } from '../ui/SwotMatrix';
import { AiCoachPanel } from '../ai/AiCoachPanel';
import { FadeIn } from '../ui/SectionHeader';
import { ProgressRing } from '../ui/ProgressRing';
import { calculateProgress } from '../../lib/progress';
import { getPillar } from '../../data/pillars';
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
  const totalProgress =
    rootVisions.length > 0
      ? Math.round(
          rootVisions.reduce((sum, v) => sum + calculateProgress(goals, v.id), 0) /
            rootVisions.length
        )
      : 0;

  return (
    <div className="mobile-container pt-2 pb-6 space-y-8">
      {syncError && (
        <p className="text-[11px] text-amber-700 dark:text-amber-300 text-center px-4">
          {syncError}
        </p>
      )}

      <FadeIn>
        <p className="text-[11px] text-aw-faint tracking-[0.2em] uppercase mb-2">
          {SPACE_GREETING[currentSpace]}
        </p>
        <h1 className="aw-display text-[2.25rem]">2026 — 2028</h1>
      </FadeIn>

      {rootVisions.length > 0 && (
        <FadeIn delay={0.04}>
          <div className="flex items-center justify-between aw-card-inner !p-5">
            <div>
              <p className="font-display text-3xl tabular-nums leading-none">{rootVisions.length}</p>
              <p className="text-[11px] text-aw-faint mt-1">vision{rootVisions.length > 1 ? 's' : ''}</p>
            </div>
            <ProgressRing progress={totalProgress} size={64} stroke={3} label="global" />
            <div className="text-right">
              <p className="font-display text-3xl tabular-nums leading-none">{goals.length}</p>
              <p className="text-[11px] text-aw-faint mt-1">objectifs</p>
            </div>
          </div>
        </FadeIn>
      )}

      {featuredVision ? (
        <FadeIn delay={0.06}>
          <VisionHero vision={featuredVision} allGoals={goals} />
        </FadeIn>
      ) : (
        <FadeIn delay={0.06}>
          <button
            type="button"
            onClick={openWizard}
            className="aw-empty-state w-full group"
          >
            <span className="w-14 h-14 rounded-full border border-aw-line flex items-center justify-center mb-5 group-active:scale-95 transition-transform">
              <Plus className="w-6 h-6 text-aw-faint" strokeWidth={1.5} />
            </span>
            <span className="aw-display text-xl">Première vision</span>
          </button>
        </FadeIn>
      )}

      {featuredVision && (
        <FadeIn delay={0.065}>
          <section>
            <h2 className="text-[11px] text-aw-faint tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
              Plan d&apos;action IA — cascade 2 ans
            </h2>
            <GoalNode goal={featuredVision} allGoals={goals} />
          </section>
        </FadeIn>
      )}

      <FadeIn delay={0.08}>
        <section className="space-y-4">
          <h2 className="text-[11px] text-aw-faint tracking-[0.15em] uppercase">
            Finance
          </h2>
          <FinanceGauges goals={goals} pillarId="financier" />
          <PillarEvolutionChart goals={goals} pillarId="financier" />
        </section>
      </FadeIn>

      {featuredVision?.swot && (
        <FadeIn delay={0.07}>
          <section>
            <h2 className="text-[11px] text-aw-faint tracking-[0.15em] uppercase mb-4">SWOT</h2>
            <SwotMatrix value={featuredVision.swot} readOnly />
          </section>
        </FadeIn>
      )}

      <section>
        <h2 className="text-[11px] text-aw-faint tracking-[0.15em] uppercase mb-4">Aujourd'hui</h2>
        <DailyTodo goals={goals} />
      </section>

      {rootVisions.length > 1 && (
        <section className="space-y-4">
          <h2 className="text-[11px] text-aw-faint tracking-[0.15em] uppercase">Cascade</h2>
          {rootVisions.slice(1).map((vision, index) => {
            const pillar = getPillar(vision.pillarId);
            const progress = calculateProgress(goals, vision.id);
            return (
              <FadeIn key={vision.id} delay={0.03 * index}>
                <article className="aw-card-inner !p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: pillar.color }}
                    />
                    <h3 className="text-sm font-medium truncate flex-1">{vision.title}</h3>
                    <span className="text-[11px] text-aw-faint tabular-nums">{progress}%</span>
                  </div>
                  <GoalNode goal={vision} allGoals={goals} compact />
                </article>
              </FadeIn>
            );
          })}
        </section>
      )}

      <AiCoachPanel goals={goals} />
    </div>
  );
}
