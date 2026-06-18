import { Moon, RotateCcw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import {
  useSabbathStore,
  SUNSET_PRESETS,
} from '../../store/useSabbathStore';
import {
  formatSunsetDisplay,
  getShabbatScheduleSummary,
  isDuringShabbat,
  normalizeSunsetTime,
} from '../../lib/sabbath';

interface SabbathSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SabbathSettingsModal({ open, onClose }: SabbathSettingsModalProps) {
  const sunsetTime = useSabbathStore((s) => s.sunsetTime);
  const presetId = useSabbathStore((s) => s.presetId);
  const setSunsetTime = useSabbathStore((s) => s.setSunsetTime);
  const applyPreset = useSabbathStore((s) => s.applyPreset);
  const resetSunsetTime = useSabbathStore((s) => s.resetSunsetTime);

  const summary = getShabbatScheduleSummary(sunsetTime);
  const duringShabbat = isDuringShabbat();

  const timeInputValue = normalizeSunsetTime(sunsetTime);

  return (
    <Modal open={open} onClose={onClose} title="Sabbat & coucher du soleil" size="md">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl px-3 py-3" style={{ backgroundColor: 'var(--aw-warm)' }}>
          <Moon className="w-5 h-5 text-aw-accent shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="min-w-0">
            <p className="text-sm font-medium">Repos sabbatique</p>
            <p className="text-[11px] text-aw-muted mt-1 leading-relaxed">
              Début : {summary.startLabel} · Fin : {summary.endLabel}
            </p>
            {duringShabbat && (
              <p className="text-[11px] text-aw-accent mt-2 font-medium">Sabbat en cours — mode repos actif</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="sabbath-sunset" className="block text-sm text-aw-muted mb-2 font-medium">
            Heure du coucher du soleil
          </label>
          <input
            id="sabbath-sunset"
            type="time"
            className="input-field w-full tabular-nums"
            value={timeInputValue}
            onChange={(e) => setSunsetTime(e.target.value)}
          />
          <p className="text-[10px] text-aw-faint mt-2 leading-relaxed">
            Utilisée pour le début du sabbat (vendredi soir) et sa fin (samedi soir).
            Actuellement : {formatSunsetDisplay(sunsetTime)}.
          </p>
        </div>

        <div>
          <p className="text-sm text-aw-muted mb-2 font-medium">Raccourcis par ville / saison</p>
          <div className="grid grid-cols-2 gap-2">
            {SUNSET_PRESETS.map((preset) => {
              const selected = presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-[11px] transition-all ${
                    selected
                      ? 'border-aw-black bg-aw-warm font-medium'
                      : 'border-aw-line hover:border-aw-lineDark'
                  }`}
                >
                  <span className="block">{preset.label}</span>
                  <span className="text-aw-faint tabular-nums">{formatSunsetDisplay(preset.time)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="btn-secondary w-full text-[12px]"
          onClick={resetSunsetTime}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Réinitialiser (Paris · printemps, 19h30)
        </button>
      </div>
    </Modal>
  );
}
