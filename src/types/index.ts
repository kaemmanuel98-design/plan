export type { Recurrence, AppView, ThemeMode, ResolvedTheme, EncouragementPing, PartnerActivity } from './premium.js';
import type { Recurrence } from './premium.js';

export type SpaceType = 'user_a' | 'user_b' | 'shared';

export type PillarId =
  | 'financier'
  | 'sport_sante'
  | 'carriere'
  | 'couple_famille'
  | 'developpement';

export type GoalLevel =
  | 'global_vision'
  | 'annual'
  | 'semester'
  | 'quarterly'
  | 'monthly'
  | 'weekly'
  | 'daily'
  | 'time_block';

export interface SwotAnalysis {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

export interface SmartValidation {
  specific: boolean;
  measurable: boolean;
  achievable: boolean;
  realistic: boolean;
  timeBound: boolean;
}

export interface Goal {
  id: string;
  parentId: string | null;
  spaceType: SpaceType;
  level: GoalLevel;
  pillarId: PillarId;
  title: string;
  description: string;
  completed: boolean;
  swot?: SwotAnalysis;
  smart?: SmartValidation;
  periodLabel?: string;
  startTime?: string;
  endTime?: string;
  recurrence?: Recurrence;
  recurrenceCompletedAt?: string;
  inspirationImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceConfig {
  id: SpaceType;
  label: string;
  subtitle: string;
  icon: string;
  private: boolean;
}

export const GOAL_LEVELS: { level: GoalLevel; label: string; childLevel?: GoalLevel }[] = [
  { level: 'global_vision', label: 'Vision Globale (2 ans)', childLevel: 'annual' },
  { level: 'annual', label: 'Objectifs Annuels', childLevel: 'semester' },
  { level: 'semester', label: 'Objectifs Semestriels', childLevel: 'quarterly' },
  { level: 'quarterly', label: 'Objectifs Trimestriels', childLevel: 'monthly' },
  { level: 'monthly', label: 'Objectifs Mensuels', childLevel: 'weekly' },
  { level: 'weekly', label: 'Objectifs Hebdomadaires', childLevel: 'daily' },
  { level: 'daily', label: 'Actions Quotidiennes', childLevel: 'time_block' },
  { level: 'time_block', label: 'Plannings Horaires' },
];

export const SMART_CRITERIA: { key: keyof SmartValidation; label: string; description: string }[] = [
  { key: 'specific', label: 'Spécifique', description: 'L\'objectif est clair et précis' },
  { key: 'measurable', label: 'Mesurable', description: 'Des indicateurs permettent de mesurer les progrès' },
  { key: 'achievable', label: 'Atteignable', description: 'L\'objectif est réalisable avec vos ressources' },
  { key: 'realistic', label: 'Réaliste', description: 'Aligné avec votre situation actuelle' },
  { key: 'timeBound', label: 'Temporel', description: 'Une échéance claire est définie (2 ans)' },
];
