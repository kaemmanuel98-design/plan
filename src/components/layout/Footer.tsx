import { PILLARS } from '../../data/pillars';

export function Footer() {
  return (
    <footer className="border-t border-aw-line bg-aw-white mt-20">
      <div className="aw-container py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="font-display text-2xl mb-2">
              Vision<span className="italic text-aw-accent">Dual</span>
            </p>
            <p className="text-sm text-aw-muted leading-relaxed max-w-xs">
              Planification stratégique de vie sur 2 ans — cascade convergente, SWOT & SMART.
            </p>
          </div>
          <div>
            <p className="aw-section-label mb-4">Piliers</p>
            <ul className="space-y-2">
              {PILLARS.map((p) => (
                <li key={p.id} className="text-sm text-aw-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.label}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="aw-section-label mb-4">Cascade</p>
            <p className="text-sm text-aw-muted leading-relaxed">
              8 niveaux — de la vision globale aux plannings horaires. Chaque objectif converge vers
              le niveau supérieur.
            </p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-aw-line flex flex-col sm:flex-row justify-between gap-2 text-xs text-aw-faint">
          <span>© {new Date().getFullYear()} E&M</span>
          <span className="italic font-display">Designed for couples who build together.</span>
        </div>
      </div>
    </footer>
  );
}
