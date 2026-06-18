import type { Goal, GoalLevel, PillarId } from '../types';
import { getLevelLabel } from './progress';

interface SuggestionContext {
  parentTitle: string;
  pillarId: PillarId;
  level: GoalLevel;
  childLevel?: GoalLevel;
}

const SUGGESTION_TEMPLATES: Record<GoalLevel, (ctx: SuggestionContext) => string[]> = {
  global_vision: () => [],
  annual: (ctx) => [
    `Définir les jalons clés pour "${ctx.parentTitle}" — Année 1`,
    `Établir un budget annuel aligné sur la vision`,
    `Planifier les revues trimestrielles de progression`,
    `Identifier les compétences à développer cette année`,
  ],
  semester: (ctx) => [
    `Objectif semestre 1 : premiers résultats mesurables pour "${ctx.parentTitle}"`,
    `Mettre en place les habitudes quotidiennes nécessaires`,
    `Réaliser un point d'étape à mi-semestre`,
    `Ajuster la stratégie selon les premiers retours`,
  ],
  quarterly: (ctx) => [
    `Décomposer "${ctx.parentTitle}" en 3 actions prioritaires ce trimestre`,
    `Fixer des indicateurs de performance trimestriels`,
    `Organiser une session de revue à la fin du trimestre`,
    `Célébrer les petites victoires acquises`,
  ],
  monthly: (ctx) => [
    `Planifier les actions du mois pour "${ctx.parentTitle}"`,
    `Bloquer du temps dans l'agenda chaque semaine`,
    `Définir un objectif chiffré atteignable ce mois`,
    `Prévoir un moment de bilan en fin de mois`,
  ],
  weekly: (ctx) => [
    `Identifier la priorité n°1 de la semaine pour "${ctx.parentTitle}"`,
    `Répartir les tâches sur les 5 jours ouvrés`,
    `Prévoir une marge pour les imprévus`,
    `Préparer la revue hebdomadaire du dimanche`,
  ],
  daily: (ctx) => [
    `Action concrète du jour liée à "${ctx.parentTitle}"`,
    `Vérifier l'alignement avec l'objectif hebdomadaire`,
    `Noter les obstacles rencontrés`,
    `Préparer la tâche prioritaire de demain`,
  ],
  time_block: (ctx) => [
    `09:00–10:00 — Travail focalisé sur "${ctx.parentTitle}"`,
    `14:00–15:00 — Session de suivi et ajustements`,
    `17:00–17:30 — Revue de fin de journée`,
  ],
};

export function generateSuggestions(
  parentGoal: Goal,
  childLevel: GoalLevel
): { title: string; level: GoalLevel }[] {
  const ctx: SuggestionContext = {
    parentTitle: parentGoal.title,
    pillarId: parentGoal.pillarId,
    level: parentGoal.level,
    childLevel,
  };

  const templates = SUGGESTION_TEMPLATES[childLevel]?.(ctx) ?? [
    `Sous-tâche pour "${parentGoal.title}"`,
    `Étape intermédiaire — ${getLevelLabel(childLevel)}`,
    `Action de suivi et mesure`,
  ];

  return templates.map((title) => ({ title, level: childLevel }));
}
