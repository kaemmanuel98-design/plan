import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useSpaceGoals } from '../../hooks/useSpaceGoals';
import {
  classifyDailyTasks,
  getQuadrantMeta,
  groupByQuadrant,
  type EisenhowerQuadrant,
} from '../../lib/eisenhower';
import { FadeIn } from '../ui/SectionHeader';

const ORDER: EisenhowerQuadrant[] = ['do', 'schedule', 'delegate', 'eliminate'];

export function EisenhowerMatrix() {
  const goals = useSpaceGoals(useStore((s) => s.currentSpace));
  const toggleGoal = useStore((s) => s.toggleGoal);

  const groups = useMemo(() => {
    const classified = classifyDailyTasks(goals);
    return groupByQuadrant(classified);
  }, [goals]);

  const total = ORDER.reduce((n, q) => n + groups[q].length, 0);

  return (
    <div className="mobile-container pt-4 pb-6 space-y-6">
      <FadeIn>
        <p className="text-[11px] text-aw-faint tracking-[0.2em] uppercase mb-2">Priorités</p>
        <h1 className="aw-display text-[1.75rem]">Matrice d'Eisenhower</h1>
        <p className="text-[11px] text-aw-faint mt-2">
          Tri automatique selon vos visions
        </p>
      </FadeIn>

      {total === 0 ? (
        <div className="aw-card-inner !py-14 text-center">
          <p className="text-[11px] text-aw-faint">Aucune tâche quotidienne</p>
        </div>
      ) : (
        <div className="eisenhower-grid">
          {ORDER.map((quadrant, qi) => {
            const meta = getQuadrantMeta(quadrant);
            const items = groups[quadrant];
            return (
              <FadeIn key={quadrant} delay={0.04 * qi}>
                <section
                  className="eisenhower-quadrant"
                  style={{
                    borderColor: `color-mix(in srgb, ${meta.color} 35%, var(--aw-line))`,
                  }}
                >
                  <header className="eisenhower-quadrant-header">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold">{meta.label}</p>
                      <p className="text-[9px] text-aw-faint">{meta.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-aw-faint tabular-nums ml-auto">
                      {items.length}
                    </span>
                  </header>
                  <ul className="eisenhower-task-list">
                    {items.length === 0 ? (
                      <li className="text-[10px] text-aw-faint py-2">—</li>
                    ) : (
                      items.map(({ goal, visionTitle }) => (
                        <li key={goal.id}>
                          <label className="eisenhower-task">
                            <input
                              type="checkbox"
                              checked={goal.completed}
                              onChange={() => toggleGoal(goal.id)}
                              className="checkbox-custom !w-[18px] !h-[18px] shrink-0"
                            />
                            <span className="min-w-0 flex-1">
                              <span
                                className={`text-[12px] font-medium block truncate ${
                                  goal.completed ? 'line-through text-aw-faint' : ''
                                }`}
                              >
                                {goal.title}
                              </span>
                              {visionTitle && (
                                <span className="text-[9px] text-aw-faint block truncate mt-0.5">
                                  {visionTitle}
                                </span>
                              )}
                            </span>
                          </label>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
              </FadeIn>
            );
          })}
        </div>
      )}
    </div>
  );
}
