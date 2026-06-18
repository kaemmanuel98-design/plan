import type { Goal, GoalLevel } from '../types';
import { generateId, getDescendants } from './progress';
import { sanitizeTitle } from './sanitize';

interface CascadeTemplate {
  level: GoalLevel;
  title: string;
  periodLabel: string;
  description?: string;
  children?: CascadeTemplate[];
}

function trimVisionTitle(title: string): string {
  const t = title.trim();
  return t.length > 48 ? `${t.slice(0, 48)}…` : t;
}

/** Arbre de planification 2 ans : année → semestre → trimestre → mois → semaine → jour */
function buildCascadeTree(visionTitle: string): CascadeTemplate[] {
  const focus = trimVisionTitle(visionTitle);

  return ([1, 2] as const).map((year) => ({
    level: 'annual' as const,
    title: `Année ${year} — ${focus}`,
    periodLabel: `An ${year}`,
    description: `Jalons de l'année ${year} vers la vision sur 2 ans.`,
    children: ([1, 2] as const).map((semester) => ({
      level: 'semester' as const,
      title: `Semestre ${semester} (An ${year})`,
      periodLabel: `An ${year} · S${semester}`,
      description:
        semester === 1
          ? 'Objectifs sur 6 mois — janvier à juin.'
          : 'Objectifs sur 6 mois — juillet à décembre.',
      children: ([1, 2] as const).map((quarterInSem) => {
        const quarterIndex = (year - 1) * 4 + (semester - 1) * 2 + quarterInSem;
        return {
          level: 'quarterly' as const,
          title: `Trimestre ${quarterInSem} — ${focus}`,
          periodLabel: `T${quarterIndex}`,
          description: 'Objectifs sur 3 mois, alignés sur le semestre.',
          children: ([1, 2, 3] as const).map((monthInQuarter) => ({
            level: 'monthly' as const,
            title: `Mois ${monthInQuarter} — plan d'action`,
            periodLabel: `T${quarterIndex} · M${monthInQuarter}`,
            description: 'Priorités du mois pour avancer vers le trimestre.',
            children: [
              {
                level: 'weekly' as const,
                title: `Semaine type — ${focus}`,
                periodLabel: `T${quarterIndex} · M${monthInQuarter} · Hebdo`,
                description: 'Répartition hebdomadaire des actions clés.',
                children: [
                  {
                    level: 'daily' as const,
                    title: 'Actions quotidiennes',
                    periodLabel: 'Quotidien',
                    description: 'Tâches du jour liées à la vision globale.',
                  },
                ],
              },
            ],
          })),
        };
      }),
    })),
  }));
}

function walkTemplate(
  parentId: string,
  node: CascadeTemplate,
  vision: Goal,
  now: string,
  out: Goal[]
): void {
  const id = generateId();
  out.push({
    id,
    parentId,
    spaceType: vision.spaceType,
    level: node.level,
    pillarId: vision.pillarId,
    title: sanitizeTitle(node.title),
    description: node.description ?? '',
    completed: false,
    periodLabel: node.periodLabel,
    createdAt: now,
    updatedAt: now,
  });

  for (const child of node.children ?? []) {
    walkTemplate(id, child, vision, now, out);
  }
}

/** Génère tous les objectifs enfants (86 par vision) pour la décomposition 2 ans. */
export function buildVisionCascadeGoals(vision: Goal): Goal[] {
  const now = new Date().toISOString();
  const goals: Goal[] = [];
  const tree = buildCascadeTree(vision.title);

  for (const annual of tree) {
    walkTemplate(vision.id, annual, vision, now, goals);
  }

  return goals;
}

/** Niveaux à déplier par défaut pour voir la progression. */
export function buildExpandedLevelsForCascade(visionId: string, cascade: Goal[]): Record<string, boolean> {
  const expanded: Record<string, boolean> = { [visionId]: true };
  for (const g of cascade) {
    if (g.level === 'annual' || g.level === 'semester' || g.level === 'quarterly') {
      expanded[g.id] = true;
    }
  }
  return expanded;
}

export const CASCADE_LEVEL_COUNTS: Record<GoalLevel, number> = {
  global_vision: 1,
  annual: 2,
  semester: 4,
  quarterly: 8,
  monthly: 24,
  weekly: 24,
  daily: 24,
  time_block: 0,
};

export const CASCADE_TOTAL_CHILDREN = 86;

const CASCADE_LEVELS: GoalLevel[] = [
  'annual',
  'semester',
  'quarterly',
  'monthly',
  'weekly',
  'daily',
];

export interface CascadeLevelStat {
  level: GoalLevel;
  label: string;
  total: number;
  completed: number;
  percent: number;
}

const LEVEL_SHORT: Record<GoalLevel, string> = {
  global_vision: 'Vision',
  annual: 'An',
  semester: '6 mois',
  quarterly: 'Trim.',
  monthly: 'Mois',
  weekly: 'Sem.',
  daily: 'Jour',
  time_block: 'Horaire',
};

export function getCascadeLevelStats(allGoals: Goal[], visionId: string): CascadeLevelStat[] {
  const descendants = getDescendants(allGoals, visionId);

  return CASCADE_LEVELS.map((level) => {
    const atLevel = descendants.filter((g) => g.level === level);
    const completed = atLevel.filter((g) => g.completed).length;
    const total = atLevel.length;
    return {
      level,
      label: LEVEL_SHORT[level],
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
}
