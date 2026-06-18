import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { SpaceType } from '../types';

export function useSpaceGoals(space: SpaceType) {
  const allGoals = useStore((s) => s.goals);
  return useMemo(() => allGoals.filter((g) => g.spaceType === space), [allGoals, space]);
}

export function useRootVisions(space: SpaceType) {
  const goals = useSpaceGoals(space);
  return useMemo(() => goals.filter((g) => g.level === 'global_vision'), [goals]);
}
