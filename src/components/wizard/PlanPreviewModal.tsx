import { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import type { DraftPlanItem } from '../../lib/planDraft';
import type { PlanSource } from '../../lib/aiPlanClient';
import { getLevelLabel } from '../../lib/progress';
import type { GoalLevel } from '../../types';

const LEVEL_ORDER: GoalLevel[] = [
  'annual',
  'semester',
  'quarterly',
  'monthly',
  'weekly',
  'daily',
  'time_block',
];

interface PlanPreviewModalProps {
  open: boolean;
  items: DraftPlanItem[];
  source: PlanSource;
  loading?: boolean;
  onClose: () => void;
  onValidate: (items: DraftPlanItem[]) => void;
}

export function PlanPreviewModal({
  open,
  items,
  source,
  loading,
  onClose,
  onValidate,
}: PlanPreviewModalProps) {
  const [draft, setDraft] = useState<DraftPlanItem[]>(items);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    annual: true,
    semester: true,
    quarterly: true,
    monthly: true,
    weekly: true,
    daily: true,
    time_block: true,
  });

  const grouped = useMemo(() => {
    const map = new Map<GoalLevel, DraftPlanItem[]>();
    for (const level of LEVEL_ORDER) {
      map.set(level, draft.filter((i) => i.level === level));
    }
    return map;
  }, [draft]);

  const updateItem = (path: string, field: 'title' | 'description', value: string) => {
    setDraft((prev) =>
      prev.map((item) => (item.path === path ? { ...item, [field]: value } : item))
    );
  };

  useEffect(() => {
    if (items.length > 0) setDraft(items);
  }, [items]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Prévisualiser le plan d'action"
      size="xl"
    >
      <div className="mb-4 flex items-center gap-2 text-[11px] text-aw-muted">
        <Sparkles className="w-4 h-4 text-aw-accent shrink-0" />
        <span>
          {source === 'ai'
            ? 'Plan généré par l\'IA — modifiez avant validation.'
            : 'Plan généré localement (mode intelligent) — modifiez avant validation.'}
        </span>
        <span className="ml-auto tabular-nums text-aw-faint">{draft.length} objectifs</span>
      </div>

      <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
        {LEVEL_ORDER.map((level) => {
          const levelItems = grouped.get(level) ?? [];
          if (levelItems.length === 0) return null;
          const isOpen = expanded[level];

          return (
            <div key={level} className="plan-preview-group">
              <button
                type="button"
                className="plan-preview-group-header"
                onClick={() => setExpanded((e) => ({ ...e, [level]: !e[level] }))}
              >
                <span>{getLevelLabel(level)}</span>
                <span className="text-aw-faint tabular-nums">{levelItems.length}</span>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isOpen && (
                <div className="space-y-2 px-3 pb-3">
                  {levelItems.map((item) => (
                    <div key={item.path} className="plan-preview-item">
                      <p className="text-[10px] text-aw-faint mb-1">{item.periodLabel}</p>
                      <input
                        className="input-field text-sm mb-1.5"
                        value={item.title}
                        onChange={(e) => updateItem(item.path, 'title', e.target.value)}
                      />
                      <textarea
                        className="input-field text-xs min-h-[52px] resize-none"
                        value={item.description}
                        onChange={(e) => updateItem(item.path, 'description', e.target.value)}
                      />
                      {item.startTime && item.endTime && (
                        <p className="text-[10px] text-aw-accent mt-1 tabular-nums">
                          {item.startTime} – {item.endTime}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 pt-5 border-t border-aw-line">
        <button type="button" className="btn-secondary flex-1" onClick={onClose} disabled={loading}>
          Retour
        </button>
        <button
          type="button"
          className="btn-primary flex-1"
          disabled={loading || draft.length === 0}
          onClick={() => onValidate(draft)}
        >
          {loading ? 'Injection…' : 'Valider et injecter le plan'}
          {!loading && <Check className="w-4 h-4" />}
        </button>
      </div>
    </Modal>
  );
}
