import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Goal, PillarId } from '../../types';
import { getPillar } from '../../data/pillars';
import { getPillarCurrentProgress, getPillarEvolution } from '../../lib/pillarEvolution';

interface PillarEvolutionChartProps {
  goals: Goal[];
  pillarId?: PillarId;
}

const W = 320;
const H = 120;
const PAD = { top: 8, right: 8, bottom: 24, left: 8 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function toPoints(values: number[]) {
  if (values.length === 0) return '';
  if (values.length === 1) {
    const x = PAD.left + INNER_W / 2;
    const y = PAD.top + INNER_H * (1 - values[0] / 100);
    return `${x},${y}`;
  }

  return values
    .map((v, i) => {
      const x = PAD.left + (i / (values.length - 1)) * INNER_W;
      const y = PAD.top + INNER_H * (1 - v / 100);
      return `${x},${y}`;
    })
    .join(' ');
}

function toAreaPath(values: number[]) {
  if (values.length === 0) return '';
  const line = toPoints(values);
  const baseY = PAD.top + INNER_H;
  const [firstPoint] = line.split(' ');
  const [fx] = firstPoint.split(',').map(Number);
  const lastPoint = line.split(' ').pop()!;
  const [lx] = lastPoint.split(',').map(Number);

  return `M ${fx} ${baseY} L ${line.replace(/ /g, ' L ')} L ${lx} ${baseY} Z`;
}

export function PillarEvolutionChart({
  goals,
  pillarId = 'financier',
}: PillarEvolutionChartProps) {
  const pillar = getPillar(pillarId);
  const data = useMemo(() => getPillarEvolution(goals, pillarId), [goals, pillarId]);
  const current = useMemo(() => getPillarCurrentProgress(goals, pillarId), [goals, pillarId]);
  const values = data.map((d) => d.value);
  const linePoints = toPoints(values);
  const areaPath = toAreaPath(values);
  const hasData = goals.some((g) => g.pillarId === pillarId);

  return (
    <article className="aw-card-inner !p-5">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${pillar.color}14`, color: pillar.color }}
          >
            <pillar.icon className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-medium">{pillar.label}</h3>
            <p className="text-[11px] text-aw-faint tabular-nums">{current}%</p>
          </div>
        </div>
        {!hasData && (
          <span className="text-[10px] text-aw-faint">—</span>
        )}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          role="img"
          aria-label={`Évolution ${pillar.label}`}
        >
          <defs>
            <linearGradient id={`grad-${pillarId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={pillar.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={pillar.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 50, 100].map((tick) => {
            const y = PAD.top + INNER_H * (1 - tick / 100);
            return (
              <line
                key={tick}
                x1={PAD.left}
                y1={y}
                x2={PAD.left + INNER_W}
                y2={y}
                stroke="var(--aw-line)"
                strokeWidth="1"
                strokeDasharray={tick === 50 ? '4 4' : undefined}
              />
            );
          })}

          {areaPath && (
            <motion.path
              d={areaPath}
              fill={`url(#grad-${pillarId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          )}

          {linePoints && (
            <motion.polyline
              points={linePoints}
              fill="none"
              stroke={pillar.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {values.map((v, i) => {
            const x =
              values.length === 1
                ? PAD.left + INNER_W / 2
                : PAD.left + (i / (values.length - 1)) * INNER_W;
            const y = PAD.top + INNER_H * (1 - v / 100);
            const isLast = i === values.length - 1;
            return (
              <g key={data[i].monthKey}>
                <circle
                  cx={x}
                  cy={y}
                  r={isLast ? 4 : 2.5}
                  fill={isLast ? pillar.color : 'var(--aw-surface)'}
                  stroke={pillar.color}
                  strokeWidth={isLast ? 0 : 1.5}
                />
                <text
                  x={x}
                  y={H - 4}
                  textAnchor="middle"
                  className="fill-[var(--aw-faint)]"
                  style={{ fontSize: 9, fontFamily: 'Inter, sans-serif' }}
                >
                  {data[i].label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </article>
  );
}
