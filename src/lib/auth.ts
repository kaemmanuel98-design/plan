import type { SpaceType } from '../types';

export interface UserProfile {
  id: string;
  displayName: string;
  spaceType: SpaceType;
  coupleId: string;
}

export function getAllowedSpaces(spaceType: SpaceType): SpaceType[] {
  if (spaceType === 'user_a') return ['user_a', 'shared'];
  if (spaceType === 'user_b') return ['user_b', 'shared'];
  return ['shared'];
}

export function isSpaceAllowed(userSpace: SpaceType, target: SpaceType): boolean {
  return getAllowedSpaces(userSpace).includes(target);
}

export const SPACE_ROLE_LABEL: Record<SpaceType, string> = {
  user_a: 'Monsieur',
  user_b: 'Madame',
  shared: 'Couple',
};
