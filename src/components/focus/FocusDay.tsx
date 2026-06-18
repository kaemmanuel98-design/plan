import { Check, Clock, Repeat } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useSpaceGoals } from '../../hooks/useSpaceGoals';
import { formatFocusDate, getFocusItems } from '../../lib/focusDay';
import { isRecurring, recurrenceShort } from '../../lib/recurrence';
import { FadeIn } from '../ui/SectionHeader';
import { ProgressRing } from '../ui/ProgressRing';

export function FocusDay() {
  const goals = useSpaceGoals(useStore((s) => s.currentSpace));
  const toggleGoal = useStore((s) => s.toggleGoal);
  const { daily, timeBlocks, progress, total, done } = getFocusItems(goals);
  const date = formatFocusDate();

  return (
    <div className="mobile-container pt-4 pb-6 space-y-8">
      <FadeIn>
        <p className="text-[11px] text-aw-faint tracking-[0.2em] uppercase mb-2">Focus</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="aw-display text-[2.5rem] capitalize leading-none">{date.weekday}</h1>
            <p className="text-sm text-aw-muted mt-1 capitalize">
              {date.day} {date.month}
            </p>
          </div>
          {total > 0 && <ProgressRing progress={progress} size={56} stroke={3} />}
        </div>
        {total > 0 && (
          <p className="text-[11px] text-aw-faint mt-3 tabular-nums">
            {done}/{total} complété{done > 1 ? 's' : ''}
          </p>
        )}
      </FadeIn>

      {total === 0 ? (
        <div className="aw-card-inner !py-16 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-aw-line flex items-center justify-center mb-4">
            <Check className="w-4 h-4 text-aw-faint" strokeWidth={1.5} />
          </div>
          <p className="aw-display text-lg">Journée libre</p>
        </div>
      ) : (
        <>
          {daily.length > 0 && (
            <section className="space-y-2">
              {daily.map((task, i) => (
                <FadeIn key={task.id} delay={0.03 * i}>
                  <label
                    className={`focus-task ${task.completed ? 'focus-task--done' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleGoal(task.id)}
                      className="checkbox-custom shrink-0"
                    />
                    <span className="flex-1 text-[15px] font-medium leading-snug">
                      {task.title}
                    </span>
                    {isRecurring(task) && task.recurrence && (
                      <span className="focus-recurrence" title="Récurrent">
                        <Repeat className="w-3 h-3" />
                        {recurrenceShort(task.recurrence)}
                      </span>
                    )}
                  </label>
                </FadeIn>
              ))}
            </section>
          )}

          {timeBlocks.length > 0 && (
            <section>
              {daily.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-aw-faint" strokeWidth={1.5} />
                  <span className="text-[11px] text-aw-faint tracking-[0.15em] uppercase">
                    Planning
                  </span>
                </div>
              )}
              <div className="space-y-2">
                {timeBlocks.map((block, i) => (
                  <FadeIn key={block.id} delay={0.04 * i}>
                    <label
                      className={`focus-block ${block.completed ? 'focus-block--done' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={block.completed}
                        onChange={() => toggleGoal(block.id)}
                        className="checkbox-custom shrink-0"
                      />
                      <span className="focus-block-time tabular-nums">
                        {block.startTime}
                        <span className="text-aw-faint mx-1">—</span>
                        {block.endTime}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">{block.title}</span>
                    </label>
                  </FadeIn>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
