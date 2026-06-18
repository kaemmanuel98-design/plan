import type { PillarId } from '../types';
import {
  Wallet,
  HeartPulse,
  Briefcase,
  Heart,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface Pillar {
  id: PillarId;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
}

export const PILLARS: Pillar[] = [
  {
    id: 'financier',
    label: 'Financier',
    description: 'Budget, investissements, épargne',
    color: '#34c759',
    bgColor: 'rgba(52, 199, 89, 0.12)',
    borderColor: 'rgba(52, 199, 89, 0.3)',
    icon: Wallet,
  },
  {
    id: 'sport_sante',
    label: 'Sport & Santé',
    description: 'Forme, alimentation, bien-être',
    color: '#ff9500',
    bgColor: 'rgba(255, 149, 0, 0.12)',
    borderColor: 'rgba(255, 149, 0, 0.3)',
    icon: HeartPulse,
  },
  {
    id: 'carriere',
    label: 'Carrière & Projets',
    description: 'Développement professionnel, business',
    color: '#0a84ff',
    bgColor: 'rgba(10, 132, 255, 0.12)',
    borderColor: 'rgba(10, 132, 255, 0.3)',
    icon: Briefcase,
  },
  {
    id: 'couple_famille',
    label: 'Couple & Famille',
    description: 'Relations, moments partagés',
    color: '#ff375f',
    bgColor: 'rgba(255, 55, 95, 0.12)',
    borderColor: 'rgba(255, 55, 95, 0.3)',
    icon: Heart,
  },
  {
    id: 'developpement',
    label: 'Développement Personnel',
    description: 'Loisirs, compétences, spiritualité',
    color: '#bf5af2',
    bgColor: 'rgba(191, 90, 242, 0.12)',
    borderColor: 'rgba(191, 90, 242, 0.3)',
    icon: Sparkles,
  },
];

export function getPillar(id: PillarId): Pillar {
  return PILLARS.find((p) => p.id === id) ?? PILLARS[0];
}
