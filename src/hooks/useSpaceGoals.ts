import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store/useStore';
import type { SpaceType } from '../types';

export function useSpaceGoals(space: SpaceType) {
  const goals = useStore(
    useShallow((s) => s.goals.filter((g) => g.spaceType === space))
  );
  return goals;
}

export function useRootVisions(space: SpaceType) {
  const goals = useSpaceGoals(space);
  return useMemo(() => goals.filter((g) => g.level === 'global_vision'), [goals]);
}
