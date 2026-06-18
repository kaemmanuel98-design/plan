import type { SpaceType } from '../types';

let profileSpace: SpaceType | null = null;
let hasSession = false;

export function setAuthContext(session: boolean, space: SpaceType | null) {
  hasSession = session;
  profileSpace = space;
}

export function getAuthContext(): { hasSession: boolean; profileSpace: SpaceType | null } {
  return { hasSession, profileSpace };
}
