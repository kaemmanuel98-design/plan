import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { SpaceType } from '../types';
import {
  getAllowedSpaces,
  isSpaceAllowed,
  SPACE_ROLE_LABEL,
  type UserProfile,
} from '../lib/auth';
import { setAuthContext } from '../lib/session';
import { mapAuthError, displayNameFromMeta, sleep, type SignupHints } from '../lib/authErrors';
import { supabase } from '../lib/supabase';
import { useStore } from './useStore';

let authSubscription: { unsubscribe: () => void } | null = null;

interface ProfileRow {
  id: string;
  display_name: string;
  space_type: SpaceType;
  couple_id: string;
}

interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  authError: string | null;
  signupNotice: string | null;
  slots: { user_a: boolean; user_b: boolean };

  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, spaceType: SpaceType, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSlots: () => Promise<void>;
  allowedSpaces: () => SpaceType[];
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    spaceType: row.space_type,
    coupleId: row.couple_id,
  };
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, space_type, couple_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[auth] fetchProfile:', error.message);
    return null;
  }
  return data ? mapProfile(data as ProfileRow) : null;
}

async function createProfileViaRpc(
  spaceType: SpaceType,
  displayName: string
): Promise<{ profile: UserProfile | null; error: string | null }> {
  if (!supabase) return { profile: null, error: 'Supabase non configuré' };

  const { data: profileRow, error } = await supabase.rpc('complete_profile', {
    p_display_name: displayName,
    p_space_type: spaceType,
  });

  if (error) {
    return { profile: null, error: mapAuthError(error.message) };
  }
  return {
    profile: profileRow ? mapProfile(profileRow as ProfileRow) : null,
    error: null,
  };
}

async function ensureProfileFromSession(
  userId: string,
  metadata: Record<string, unknown> | undefined,
  hints?: SignupHints
): Promise<{ profile: UserProfile | null; error: string | null }> {
  if (!supabase) return { profile: null, error: 'Supabase non configuré' };

  const spaceType =
    hints?.spaceType ??
    (metadata?.space_type === 'user_a' || metadata?.space_type === 'user_b'
      ? metadata.space_type
      : null);

  const displayName =
    hints?.displayName ??
    (spaceType ? displayNameFromMeta(metadata, spaceType) : 'Utilisateur');

  for (let attempt = 0; attempt < 6; attempt++) {
    const existing = await fetchProfile(userId);
    if (existing) return { profile: existing, error: null };

    if (spaceType && attempt >= 2) {
      const created = await createProfileViaRpc(spaceType, displayName);
      if (created.profile) return { profile: created.profile, error: null };
      if (created.error && attempt === 5) {
        return { profile: null, error: created.error };
      }
    }

    await sleep(300 + attempt * 200);
  }

  if (!spaceType) {
    return { profile: null, error: 'Rôle (Monsieur/Madame) introuvable sur ce compte.' };
  }

  const lastTry = await createProfileViaRpc(spaceType, displayName);
  if (lastTry.profile) return { profile: lastTry.profile, error: null };

  return {
    profile: null,
    error:
      lastTry.error ??
      'Impossible de créer le profil. Exécutez le script SQL 006 dans Supabase, puis reconnectez-vous.',
  };
}

async function fetchSlots(): Promise<{ user_a: boolean; user_b: boolean }> {
  if (!supabase) return { user_a: false, user_b: false };
  const { data, error } = await supabase.rpc('get_couple_slots');
  if (error || !data) return { user_a: false, user_b: false };
  const slots = data as { user_a?: boolean; user_b?: boolean };
  return { user_a: Boolean(slots.user_a), user_b: Boolean(slots.user_b) };
}

function applyProfileToApp(profile: UserProfile | null) {
  setAuthContext(Boolean(profile), profile?.spaceType ?? null);
  const store = useStore.getState();
  if (!profile) return;
  const allowed = getAllowedSpaces(profile.spaceType);
  if (!allowed.includes(store.currentSpace)) {
    store.setCurrentSpace(profile.spaceType);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,
  authError: null,
  signupNotice: null,
  slots: { user_a: false, user_b: false },

  allowedSpaces: () => {
    const profile = get().profile;
    return profile ? getAllowedSpaces(profile.spaceType) : [];
  },

  refreshSlots: async () => {
    const slots = await fetchSlots();
    set({ slots });
  },

  init: async () => {
    if (!supabase) {
      setAuthContext(false, null);
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    await get().refreshSlots();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    let profile: UserProfile | null = null;
    if (session?.user) {
      const result = await ensureProfileFromSession(session.user.id, session.user.user_metadata);
      profile = result.profile;
    }

    set({ session, profile, isLoading: false });
    applyProfileToApp(profile);

    if (!authSubscription) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        let nextProfile: UserProfile | null = null;
        if (nextSession?.user) {
          const result = await ensureProfileFromSession(
            nextSession.user.id,
            nextSession.user.user_metadata
          );
          nextProfile = result.profile;
        }
        setAuthContext(Boolean(nextSession && nextProfile), nextProfile?.spaceType ?? null);
        set({ session: nextSession, profile: nextProfile });
        applyProfileToApp(nextProfile);
        if (nextSession) {
          await useStore.getState().loadGoals();
        } else {
          useStore.getState().setGoals([]);
        }
        await get().refreshSlots();
      });
      authSubscription = data.subscription;
    }
  },

  signIn: async (email, password) => {
    if (!supabase) return;
    set({ authError: null, signupNotice: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ authError: mapAuthError(error.message) });
      throw error;
    }
    const profileResult = data.user
      ? await ensureProfileFromSession(data.user.id, data.user.user_metadata)
      : { profile: null, error: null };
    if (!profileResult.profile) {
      set({
        authError:
          profileResult.error ??
          'Profil introuvable. Exécutez le script SQL 006 dans Supabase puis reconnectez-vous.',
      });
      await supabase.auth.signOut();
      throw new Error('Profil introuvable');
    }
    set({ session: data.session, profile: profileResult.profile });
    applyProfileToApp(profileResult.profile);
    await useStore.getState().loadGoals();
  },

  signUp: async (email, password, spaceType, displayName) => {
    if (!supabase) return;
    set({ authError: null, signupNotice: null });

    const label = displayName.trim() || SPACE_ROLE_LABEL[spaceType];
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: label,
          space_type: spaceType,
        },
      },
    });

    if (error) {
      set({ authError: mapAuthError(error.message) });
      throw error;
    }
    if (!data.user) throw new Error('Inscription échouée');

    if (!data.session) {
      set({
        signupNotice:
          'Compte créé ! Si la confirmation e-mail est activée, cliquez le lien reçu puis connectez-vous.',
      });
      await get().refreshSlots();
      return;
    }

    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    const hints: SignupHints = { spaceType, displayName: label };
    const profileResult = await ensureProfileFromSession(data.user.id, data.user.user_metadata, hints);

    if (!profileResult.profile) {
      set({
        authError:
          profileResult.error ??
          'Profil non créé. Exécutez le script SQL 006 dans Supabase, puis utilisez Connexion.',
        signupNotice: 'Votre compte existe peut-être déjà — essayez de vous connecter.',
      });
      throw new Error('Profil non créé');
    }

    set({ session: data.session, profile: profileResult.profile });
    applyProfileToApp(profileResult.profile);
    await get().refreshSlots();
    await useStore.getState().loadGoals();
  },

  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthContext(false, null);
    set({ session: null, profile: null, authError: null });
    useStore.getState().setGoals([]);
  },
}));

export { isSpaceAllowed };
