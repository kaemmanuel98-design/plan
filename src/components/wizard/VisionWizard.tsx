import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, ImagePlus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { SwotMatrix } from '../ui/SwotMatrix';
import { PILLARS } from '../../data/pillars';
import { SMART_CRITERIA } from '../../types';
import type { PillarId, SwotAnalysis, SmartValidation } from '../../types';
import { readImageFile } from '../../lib/imageUpload';
import { sanitizeDescription, sanitizeTitle } from '../../lib/sanitize';
import { useStore, defaultSmart } from '../../store/useStore';

const STEPS = ['Définition & Pilier', 'Analyse SWOT', 'Validation SMART'];

export function VisionWizard() {
  const wizardOpen = useStore((s) => s.wizardOpen);
  const closeWizard = useStore((s) => s.closeWizard);
  const createVision = useStore((s) => s.createVision);
  const currentSpace = useStore((s) => s.currentSpace);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pillarId, setPillarId] = useState<PillarId>('financier');
  const [swot, setSwot] = useState<SwotAnalysis>({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
  });
  const [smart, setSmart] = useState<SmartValidation>({ ...defaultSmart });
  const [inspirationImageUrl, setInspirationImageUrl] = useState<string | undefined>();
  const [imageError, setImageError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep(0);
    setTitle('');
    setDescription('');
    setPillarId('financier');
    setSwot({ strengths: '', weaknesses: '', opportunities: '', threats: '' });
    setSmart({ ...defaultSmart });
    setInspirationImageUrl(undefined);
    setImageError(null);
  };

  const handleClose = () => {
    closeWizard();
    reset();
  };

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return swot.strengths.trim().length > 0;
    if (step === 2) return Object.values(smart).every(Boolean);
    return false;
  };

  const handleSubmit = () => {
    createVision(currentSpace, {
      title: sanitizeTitle(title),
      description: sanitizeDescription(description),
      pillarId,
      swot,
      smart,
      inspirationImageUrl,
    });
    reset();
  };

  return (
    <Modal open={wizardOpen} onClose={handleClose} title="Nouvelle Vision Globale (2 ans)" size="xl">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < step
                    ? 'bg-aw-primary text-aw-primary-fg'
                    : i === step
                      ? 'bg-aw-warm text-aw-black border border-aw-black'
                      : 'bg-aw-bg text-aw-faint border border-aw-line'
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  i === step ? 'text-aw-black font-semibold' : 'text-aw-faint'
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-aw-primary' : 'bg-aw-line'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-aw-muted mb-2 font-medium">Titre de la vision</label>
                <input
                  className="input-field"
                  placeholder="Ex: Atteindre l'indépendance financière"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-aw-muted mb-2 font-medium">Description</label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Décrivez votre vision à 2 ans..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-aw-muted mb-2 font-medium">Vision board</label>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-28 rounded-xl border border-dashed border-aw-line flex flex-col items-center justify-center overflow-hidden"
                >
                  {inspirationImageUrl ? (
                    <img src={inspirationImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5 text-aw-faint mb-1" />
                      <span className="text-[11px] text-aw-faint">Image d'inspiration</span>
                    </>
                  )}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImageError(null);
                    const dataUrl = await readImageFile(file);
                    if (!dataUrl) {
                      setImageError('Image invalide ou trop lourde (max 800 Ko).');
                      e.target.value = '';
                      return;
                    }
                    setInspirationImageUrl(dataUrl);
                    e.target.value = '';
                  }}
                />
                {imageError && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">{imageError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-aw-muted mb-3 font-medium">Pilier de vie</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PILLARS.map((pillar) => {
                    const Icon = pillar.icon;
                    const selected = pillarId === pillar.id;
                    return (
                      <button
                        key={pillar.id}
                        onClick={() => setPillarId(pillar.id)}
                        className={`flex items-center gap-3 p-4 border text-left transition-all ${
                          selected
                            ? 'border-aw-black bg-aw-warm'
                            : 'border-aw-line bg-aw-white hover:border-aw-lineDark'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: pillar.bgColor }}
                        >
                          <Icon className="w-4 h-4" style={{ color: pillar.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-aw-black">{pillar.label}</p>
                          <p className="text-[11px] text-aw-muted">{pillar.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[11px] text-aw-faint text-center tracking-wide">
                Interne · Externe × Positif · Négatif
              </p>
              <SwotMatrix value={swot} onChange={setSwot} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-aw-muted mb-4">
                Confirmez que votre objectif respecte les critères SMART :
              </p>
              {SMART_CRITERIA.map(({ key, label, description }) => (
                <button
                  key={key}
                  onClick={() => setSmart({ ...smart, [key]: !smart[key] })}
                  className={`w-full flex items-center gap-4 p-4 border text-left transition-all ${
                    smart[key]
                      ? 'border-aw-black bg-aw-warm'
                      : 'border-aw-line bg-aw-white hover:border-aw-lineDark'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-sm flex items-center justify-center transition-all ${
                      smart[key] ? 'bg-aw-primary' : 'bg-aw-bg border border-aw-line'
                    }`}
                  >
                    {smart[key] && <Check className="w-3.5 h-3.5 text-aw-primary-fg" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-aw-black">
                      <span className="text-aw-accent font-bold">{label[0]}</span>
                      {label.slice(1)}
                    </p>
                    <p className="text-xs text-aw-muted">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col-reverse sm:flex-row items-stretch gap-3 mt-6 pt-5 border-t border-aw-line">
        <button
          className="btn-secondary flex-1"
          onClick={() => (step > 0 ? setStep(step - 1) : handleClose())}
        >
          <ChevronLeft className="w-4 h-4" />
          {step > 0 ? 'Précédent' : 'Annuler'}
        </button>

        {step < STEPS.length - 1 ? (
          <button className="btn-primary flex-1" disabled={!canProceed()} onClick={() => setStep(step + 1)}>
            Suivant
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button className="btn-primary flex-1" disabled={!canProceed()} onClick={handleSubmit}>
            Créer la vision
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </Modal>
  );
}
