export type { CascadePathNode } from './retroPlanning';
export {
  enumerateRetroCascadePaths,
  enumerateRetroCascadePaths as enumerateCascadePaths,
  getHorizonPosition,
  formatCountdown,
  isTacticalLevel,
  RETRO_PATHS,
} from './retroPlanning';

import { enumerateRetroCascadePaths } from './retroPlanning';

/** Chemins de rétro-planification (structure + tactique mois courant). */
export const CASCADE_PATHS = enumerateRetroCascadePaths();

export function getCascadePaths(startDate = new Date(), now = new Date()) {
  return enumerateRetroCascadePaths(startDate, now);
}
