import { ShieldAlert, Sparkles, TrendingUp, TriangleAlert } from 'lucide-react';
import type { SwotAnalysis } from '../../types';

type SwotKey = keyof SwotAnalysis;

const QUADRANTS: {
  key: SwotKey;
  label: string;
  hint: string;
  row: 'interne' | 'externe';
  col: 'positif' | 'negatif';
  color: string;
  Icon: typeof TrendingUp;
}[] = [
  {
    key: 'strengths',
    label: 'Forces',
    hint: 'Atouts internes',
    row: 'interne',
    col: 'positif',
    color: '#34c759',
    Icon: TrendingUp,
  },
  {
    key: 'weaknesses',
    label: 'Faiblesses',
    hint: 'Limites internes',
    row: 'interne',
    col: 'negatif',
    color: '#ff9500',
    Icon: TriangleAlert,
  },
  {
    key: 'opportunities',
    label: 'Opportunités',
    hint: 'Chances externes',
    row: 'externe',
    col: 'positif',
    color: '#0a84ff',
    Icon: Sparkles,
  },
  {
    key: 'threats',
    label: 'Menaces',
    hint: 'Risques externes',
    row: 'externe',
    col: 'negatif',
    color: '#ff375f',
    Icon: ShieldAlert,
  },
];

interface SwotMatrixProps {
  value: SwotAnalysis;
  onChange?: (value: SwotAnalysis) => void;
  readOnly?: boolean;
}

function QuadrantCell({
  quadrant,
  content,
  readOnly,
  onChange,
}: {
  quadrant: (typeof QUADRANTS)[number];
  content: string;
  readOnly: boolean;
  onChange: (text: string) => void;
}) {
  const { label, hint, color, Icon } = quadrant;

  return (
    <div
      className="swot-quadrant flex flex-col min-h-[130px] p-3"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 8%, var(--aw-surface))` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold leading-tight">{label}</p>
          <p className="text-[9px] text-aw-faint leading-tight">{hint}</p>
        </div>
      </div>

      {readOnly ? (
        <p className="text-[11px] text-aw-muted leading-relaxed flex-1 line-clamp-5">
          {content.trim() || '—'}
        </p>
      ) : (
        <textarea
          className="swot-input flex-1 w-full resize-none bg-transparent text-[11px] leading-relaxed
                     text-aw-black placeholder:text-aw-faint focus:outline-none"
          placeholder="…"
          value={content}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function SwotMatrix({ value, onChange, readOnly = false }: SwotMatrixProps) {
  const interne = QUADRANTS.filter((q) => q.row === 'interne');
  const externe = QUADRANTS.filter((q) => q.row === 'externe');

  const renderRow = (quadrants: typeof QUADRANTS, rowLabel: string) => (
    <div className="flex gap-px">
      <div className="swot-axis-label">{rowLabel}</div>
      <div className="flex-1 grid grid-cols-2 gap-px min-w-0">
        {quadrants.map((q) => (
          <QuadrantCell
            key={q.key}
            quadrant={q}
            content={value[q.key]}
            readOnly={readOnly}
            onChange={(text) => onChange?.({ ...value, [q.key]: text })}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="swot-matrix">
      <div className="flex gap-px mb-px">
        <div className="swot-axis-corner" />
        <div className="flex-1 grid grid-cols-2 gap-px min-w-0">
          <AxisHeader label="Positif" symbol="+" />
          <AxisHeader label="Négatif" symbol="−" />
        </div>
      </div>

      <div className="flex flex-col gap-px">
        {renderRow(interne, 'Interne')}
        {renderRow(externe, 'Externe')}
      </div>
    </div>
  );
}

function AxisHeader({ label, symbol }: { label: string; symbol: string }) {
  return (
    <div className="swot-axis-header flex items-center justify-center gap-1.5 py-2">
      <span className="text-[10px] font-medium text-aw-faint tracking-wide">{label}</span>
      <span className="w-4 h-4 rounded-full text-[9px] font-semibold flex items-center justify-center"
        style={{ backgroundColor: 'var(--aw-warm)', color: 'var(--aw-muted)' }}
      >
        {symbol}
      </span>
    </div>
  );
}

export function SwotMatrixLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {QUADRANTS.map(({ key, label, color }) => (
        <span key={key} className="inline-flex items-center gap-1.5 text-[10px] text-aw-faint">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}
