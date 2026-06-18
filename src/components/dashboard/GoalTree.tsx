import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Sparkles, Trash2, Clock, Repeat } from 'lucide-react';
import type { Goal, Recurrence } from '../../types';
import { getPillar } from '../../data/pillars';
import { PillarBadge } from '../ui/PillarBadge';
import { ProgressBar } from '../ui/ProgressBar';
import {
  calculateProgress,
  getChildren,
  getChildLevel,
  getLevelLabel,
  findRootVision,
} from '../../lib/progress';
import { generateSuggestions } from '../../lib/suggestions';
import { useStore } from '../../store/useStore';
import { isRecurring, recurrenceShort } from '../../lib/recurrence';

interface GoalNodeProps {
  goal: Goal;
  allGoals: Goal[];
  depth?: number;
  compact?: boolean;
}

export function GoalNode({ goal, allGoals, depth = 0, compact = false }: GoalNodeProps) {
  const toggleGoal = useStore((s) => s.toggleGoal);
  const addGoal = useStore((s) => s.addGoal);
  const addSuggestedGoals = useStore((s) => s.addSuggestedGoals);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const expandedLevels = useStore((s) => s.expandedLevels);
  const toggleExpanded = useStore((s) => s.toggleExpanded);

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRecurrence, setNewRecurrence] = useState<Recurrence>('none');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const children = getChildren(allGoals, goal.id);
  const childLevel = getChildLevel(goal.level);
  const progress = calculateProgress(allGoals, goal.id);
  const pillar = getPillar(goal.pillarId);
  const isExpanded = expandedLevels[goal.id] ?? depth < 2;
  const suggestions = childLevel ? generateSuggestions(goal, childLevel) : [];

  const handleAdd = () => {
    if (!newTitle.trim() || !childLevel) return;
    const extras: Partial<Goal> = {};
    if (newRecurrence !== 'none' && (childLevel === 'daily' || childLevel === 'weekly' || childLevel === 'time_block')) {
      extras.recurrence = newRecurrence;
    }
    addGoal(goal.id, childLevel, newTitle.trim(), extras);
    setNewTitle('');
    setNewRecurrence('none');
    setShowAdd(false);
  };

  const canSetRecurrence =
    childLevel === 'daily' || childLevel === 'weekly' || childLevel === 'time_block';

  const handleAddSuggestions = () => {
    if (!childLevel) return;
    addSuggestedGoals(goal.id, suggestions);
    setShowSuggestions(false);
  };

  return (
    <div className={depth > 0 ? 'ml-2 pl-3 border-l border-aw-line' : ''}>
      <motion.div
        layout
        className={`group transition-all ${
          compact ? 'mb-2' : 'aw-card-inner mb-3'
        } ${goal.completed ? 'opacity-45' : ''}`}
      >
        <div className={`flex items-start gap-3 ${compact ? 'py-1' : ''}`}>
          <input
            type="checkbox"
            checked={goal.completed}
            onChange={() => toggleGoal(goal.id)}
            className="checkbox-custom mt-0.5"
          />

          <div className="flex-1 min-w-0">
            {!compact && (
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="aw-section-label !text-[10px]">{getLevelLabel(goal.level)}</span>
                {goal.periodLabel && (
                  <span className="text-[10px] text-aw-faint">{goal.periodLabel}</span>
                )}
                {depth === 0 && <PillarBadge pillarId={goal.pillarId} />}
              </div>
            )}

            <p
              className={`${compact ? 'text-[13px]' : 'text-sm'} font-medium ${
                goal.completed ? 'line-through text-aw-faint' : 'text-aw-black'
              }`}
            >
              {goal.title}
            </p>

            {isRecurring(goal) && goal.recurrence && (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-aw-accent">
                <Repeat className="w-3 h-3" />
                {recurrenceShort(goal.recurrence)}
              </span>
            )}

            {!compact && goal.description && (
              <p className="text-xs text-aw-muted mt-1 line-clamp-1">{goal.description}</p>
            )}

            {!compact && goal.startTime && goal.endTime && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-aw-muted font-mono">
                <Clock className="w-3 h-3" />
                {goal.startTime} — {goal.endTime}
              </div>
            )}

            {children.length > 0 && !compact && (
              <div className="mt-3">
                <ProgressBar progress={progress} color={pillar.color} size="sm" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-0.5">
            {children.length > 0 && (
              <button onClick={() => toggleExpanded(goal.id)} className="btn-ghost p-2">
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            )}
            {childLevel && (
              <>
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="btn-ghost p-2"
                  title="Suggérer des étapes"
                >
                  <Sparkles className="w-4 h-4 text-aw-accent" />
                </button>
                <button onClick={() => setShowAdd(!showAdd)} className="btn-ghost p-2">
                  <Plus className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={() => deleteGoal(goal.id)} className="btn-ghost !min-w-[40px] !min-h-[40px] text-aw-faint">
              <Trash2 className="w-4 h-4" />
            </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-aw-line">
                <p className="text-xs font-semibold uppercase tracking-wider text-aw-accent mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Suggestions — {getLevelLabel(childLevel!)}
                </p>
                <div className="space-y-2 mb-4">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="text-sm text-aw-muted bg-aw-bg px-4 py-3 border border-aw-line"
                    >
                      {s.title}
                    </div>
                  ))}
                </div>
                <button className="btn-primary !py-2 !px-4 text-xs" onClick={handleAddSuggestions}>
                  Ajouter toutes
                </button>
              </div>
            </motion.div>
          )}

          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-aw-line space-y-3">
                <input
                  className="input-field w-full !py-2.5"
                  placeholder={`Nouvel objectif ${getLevelLabel(childLevel!).toLowerCase()}…`}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  autoFocus
                />
                {canSetRecurrence && (
                  <div className="flex gap-2">
                    {(
                      [
                        ['none', 'Une fois'],
                        ['weekly', 'Semaine'],
                        ['monthly', 'Mois'],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setNewRecurrence(value)}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                          newRecurrence === value
                            ? 'bg-aw-primary text-aw-primary-fg'
                            : 'bg-aw-warm text-aw-muted'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <button className="btn-primary w-full !py-2.5" onClick={handleAdd}>
                  Ajouter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isExpanded &&
          children.map((child) => (
            <GoalNode key={child.id} goal={child} allGoals={allGoals} depth={depth + 1} compact={compact} />
          ))}
      </AnimatePresence>
    </div>
  );
}

interface DailyTodoProps {
  goals: Goal[];
}

export function DailyTodo({ goals }: DailyTodoProps) {
  const toggleGoal = useStore((s) => s.toggleGoal);
  const dailyGoals = goals.filter((g) => g.level === 'daily');
  const timeBlocks = goals.filter((g) => g.level === 'time_block');

  if (dailyGoals.length === 0 && timeBlocks.length === 0) {
    return (
      <div className="aw-card-inner !py-12 flex flex-col items-center justify-center">
        <div className="w-8 h-px bg-aw-line mb-4" />
        <p className="text-[11px] text-aw-faint">Rien pour aujourd'hui</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dailyGoals.length > 0 && (
        <div className="space-y-3">
          {dailyGoals.map((goal) => {
            const rootVision = findRootVision(goals, goal.id);
            const pillar = getPillar(goal.pillarId);
            return (
              <label
                key={goal.id}
                className={`aw-card-inner flex items-start gap-3 cursor-pointer active:scale-[0.99] transition-transform ${
                  goal.completed ? 'opacity-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleGoal(goal.id)}
                  className="checkbox-custom mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      goal.completed ? 'line-through text-aw-faint' : 'text-aw-black'
                    }`}
                  >
                    {goal.title}
                  </p>
                  {rootVision && (
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full mt-2"
                      style={{ backgroundColor: pillar.color }}
                      title={rootVision.title}
                    />
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {timeBlocks.length > 0 && (
        <div className="space-y-2">
          {timeBlocks
              .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
              .map((block) => (
                <div
                  key={block.id}
                  className={`aw-card-inner flex items-center gap-4 md:gap-6 ${
                    block.completed ? 'opacity-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={block.completed}
                    onChange={() => toggleGoal(block.id)}
                    className="checkbox-custom"
                  />
                  <div className="w-32 text-xs font-mono font-semibold text-aw-black tabular-nums">
                    {block.startTime} — {block.endTime}
                  </div>
                  <p
                    className={`text-sm flex-1 ${
                      block.completed ? 'line-through text-aw-faint' : 'text-aw-black'
                    }`}
                  >
                    {block.title}
                  </p>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
