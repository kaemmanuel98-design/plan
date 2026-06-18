import type { PillarId, SwotAnalysis } from '../types';
import { getPillar } from '../data/pillars';
import type { CascadePathNode } from './cascadePaths';
import { getCascadePaths } from './cascadePaths';

export interface VisionPlanInput {
  title: string;
  description: string;
  pillarId: PillarId;
  swot: SwotAnalysis;
}

export interface PlanContent {
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
}

export interface GeneratePlanOptions {
  startDate?: Date;
  now?: Date;
  tacticalOnly?: boolean;
}

const PILLAR_MILESTONES: Record<
  PillarId,
  {
    y1: string;
    y2: string;
    semester: string;
    quarter: string;
    month: string;
    week: string;
    day: string;
    block: string;
  }
> = {
  financier: {
    y1: "Construire l'épargne et le budget alignés sur la vision",
    y2: 'Consolider le patrimoine et atteindre le jalon financier cible',
    semester: 'Piloter le budget sur 6 mois et ajuster les flux',
    quarter: "Atteindre les objectifs d'épargne et de dépenses du trimestre",
    month: 'Exécuter le plan financier du mois (épargne, suivi, arbitrages)',
    week: 'Réviser les comptes et respecter le budget hebdomadaire',
    day: 'Vérifier les dépenses et avancer sur une action financière concrète',
    block: 'Bloc budget / épargne',
  },
  sport_sante: {
    y1: 'Installer des routines santé durables et mesurer les progrès',
    y2: 'Atteindre la forme cible et ancrer les habitudes sur le long terme',
    semester: 'Programme sport & récupération sur 6 mois',
    quarter: 'Objectifs fitness et bien-être du trimestre',
    month: "Plan d'entraînement et nutrition du mois",
    week: 'Séances planifiées et suivi sommeil / énergie',
    day: 'Séance, marche ou rituel bien-être du jour',
    block: 'Séance sport / bien-être',
  },
  carriere: {
    y1: 'Développer les compétences clés et les premiers résultats pro',
    y2: 'Atteindre le poste / projet cible et capitaliser sur l\'expertise',
    semester: 'Feuille de route carrière sur 6 mois',
    quarter: 'Livrables professionnels et visibilité du trimestre',
    month: 'Priorités projet et montée en compétences du mois',
    week: 'Tâches pro prioritaires et networking ciblé',
    day: 'Action métier à fort impact pour la vision',
    block: 'Focus carrière',
  },
  couple_famille: {
    y1: 'Renforcer les fondations du couple et les projets communs',
    y2: 'Réaliser le projet familial fixé dans la vision à 2 ans',
    semester: 'Moments de qualité et décisions partagées sur 6 mois',
    quarter: 'Rituels à deux et avancées concrètes du trimestre',
    month: 'Temps de couple et étapes familiales du mois',
    week: 'Rendez-vous, communication et tâches partagées',
    day: 'Geste ou discussion qui rapproche du projet commun',
    block: 'Temps de couple',
  },
  developpement: {
    y1: "Lancer l'apprentissage et les pratiques personnelles ciblées",
    y2: 'Maîtriser la compétence / le projet perso de la vision',
    semester: 'Parcours de croissance personnelle sur 6 mois',
    quarter: "Objectifs d'apprentissage et créativité du trimestre",
    month: 'Lectures, pratique et projets perso du mois',
    week: 'Blocs de pratique et réflexion hebdomadaire',
    day: '20 min de pratique alignée sur la vision',
    block: 'Pratique personnelle',
  },
};

const DAILY_VERBS = [
  'Avancer sur',
  'Compléter une étape de',
  'Préparer',
  'Réviser le plan pour',
  'Mesurer les progrès vers',
];

const BLOCK_SLOTS = [
  { start: '07:00', end: '08:00', suffix: 'Matin — focus' },
  { start: '12:30', end: '13:00', suffix: 'Midi — point' },
  { start: '18:00', end: '19:00', suffix: 'Soir — action clé' },
];

function swotHint(swot: SwotAnalysis, year: number, quarterInSem: number): string {
  if (year === 1 && swot.strengths.trim()) {
    return `Appuyer sur : ${swot.strengths.trim().slice(0, 80)}`;
  }
  if (year === 2 && swot.opportunities.trim()) {
    return `Saisir : ${swot.opportunities.trim().slice(0, 80)}`;
  }
  if (quarterInSem === 2 && swot.weaknesses.trim()) {
    return `Réduire : ${swot.weaknesses.trim().slice(0, 60)}`;
  }
  if (swot.threats.trim()) {
    return `Anticiper : ${swot.threats.trim().slice(0, 60)}`;
  }
  return '';
}

function trimTitle(title: string, max = 120): string {
  const t = title.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function blockTimes(path: CascadePathNode): { startTime: string; endTime: string } {
  const idx = parseInt(path.path.split('.tb')[1] ?? '1', 10) - 1;
  const slot = BLOCK_SLOTS[idx] ?? BLOCK_SLOTS[0];
  return { startTime: slot.start, endTime: slot.end };
}

/** Générateur local contextuel (sans API) — utilise vision, pilier et SWOT. */
export function generateSmartPlanContent(path: CascadePathNode, input: VisionPlanInput): PlanContent {
  const pillar = getPillar(input.pillarId);
  const m = PILLAR_MILESTONES[input.pillarId];
  const vision = input.title.trim();
  const short = vision.length > 42 ? `${vision.slice(0, 42)}…` : vision;
  const hint = swotHint(input.swot, path.year, path.quarterInSem);

  switch (path.level) {
    case 'annual':
      return {
        title: trimTitle(
          path.year === 1 ? `An 1 — ${m.y1} : ${short}` : `An 2 — ${m.y2} : ${short}`
        ),
        description: trimTitle(
          `${path.year === 1 ? 'Phase de lancement' : 'Phase de consolidation'} pour « ${vision} ». ${input.description || m.y1}. Pilier ${pillar.label}.${hint ? ` ${hint}.` : ''}`,
          200
        ),
      };

    case 'semester':
      return {
        title: trimTitle(`S${path.semester} (An ${path.year}) — ${m.semester}`),
        description: trimTitle(
          `Objectifs sur 6 mois (${path.semester === 1 ? 'janv.–juin' : 'juil.–déc.'}) pour rapprocher « ${short} » du résultat visé.${hint ? ` ${hint}.` : ''}`,
          200
        ),
      };

    case 'quarterly': {
      const qIndex = (path.year - 1) * 4 + (path.semester - 1) * 2 + path.quarterInSem;
      return {
        title: trimTitle(`T${path.quarterInSem} — ${m.quarter} (${short})`),
        description: trimTitle(
          `Trimestre ${qIndex} : jalons concrets vers la vision. ${m.quarter}.${hint ? ` ${hint}.` : ''}`,
          200
        ),
      };
    }

    case 'monthly':
      return {
        title: trimTitle(`${path.periodLabel} — ${m.month}`),
        description: trimTitle(`Priorités du mois pour « ${short} ».`, 200),
      };

    case 'weekly':
      return {
        title: trimTitle(`Semaine ${path.weekInMonth ?? 1} — ${m.week}`),
        description: trimTitle(
          `Dim.–ven. (repos sabbatique ven. soir → sam. soir). Répartition hebdomadaire pour « ${short} ».`,
          200
        ),
      };

    case 'daily': {
      const verb = DAILY_VERBS[(path.year + path.semester + (path.monthInQuarter ?? 0)) % DAILY_VERBS.length];
      return {
        title: trimTitle(`${verb} ${short}`),
        description: trimTitle(`${m.day}. Micro-action quotidienne liée à la vision sur 2 ans.`, 200),
      };
    }

    case 'time_block': {
      const { startTime, endTime } = blockTimes(path);
      const idx = parseInt(path.path.split('.tb')[1] ?? '1', 10) - 1;
      const suffix = BLOCK_SLOTS[idx]?.suffix ?? 'Action';
      return {
        title: trimTitle(`${startTime} – ${endTime} : ${m.block}`),
        description: trimTitle(`${suffix} — intégrer l'action du jour dans votre emploi du temps.`, 200),
        startTime,
        endTime,
      };
    }

    default:
      return { title: short, description: input.description };
  }
}

export function generateSmartPlanMap(
  input: VisionPlanInput,
  options: GeneratePlanOptions = {}
): Record<string, PlanContent> {
  const startDate = options.startDate ?? new Date();
  const now = options.now ?? new Date();
  const paths = getCascadePaths(startDate, now);
  const filtered = options.tacticalOnly ? paths.filter((p) => p.level === 'weekly' || p.level === 'daily' || p.level === 'time_block') : paths;

  const map: Record<string, PlanContent> = {};
  for (const path of filtered) {
    map[path.path] = generateSmartPlanContent(path, input);
  }
  return map;
}
