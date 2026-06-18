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
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useStore } from './useStore';

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

  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : null;
}

async function fetchSlots(): Promise<{ user_a: boolean; user_b: boolean }> {
  if (!supabase) return { user_a: false, user_b: false };
  const { data, error } = await supabase.from('profiles').select('space_type');
  if (error) return { user_a: false, user_b: false };
  const types = new Set((data ?? []).map((r) => r.space_type as SpaceType));
  return { user_a: types.has('user_a'), user_b: types.has('user_b') };
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
  isLoading: Boolean(isSupabaseConfigured),
  authError: null,
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
      try {
        profile = await fetchProfile(session.user.id);
      } catch {
        profile = null;
      }
    }

    set({ session, profile, isLoading: false });
    applyProfileToApp(profile);

    supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      let nextProfile: UserProfile | null = null;
      if (nextSession?.user) {
        try {
          nextProfile = await fetchProfile(nextSession.user.id);
        } catch {
          nextProfile = null;
        }
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
  },

  signIn: async (email, password) => {
    if (!supabase) return;
    set({ authError: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ authError: error.message });
      throw error;
    }
    const profile = data.user ? await fetchProfile(data.user.id) : null;
    if (!profile) {
      set({ authError: 'Profil introuvable. Terminez votre inscription.' });
      await supabase.auth.signOut();
      throw new Error('Profil introuvable');
    }
    set({ session: data.session, profile });
    applyProfileToApp(profile);
    await useStore.getState().loadGoals();
  },

  signUp: async (email, password, spaceType, displayName) => {
    if (!supabase) return;
    set({ authError: null });

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ authError: error.message });
      throw error;
    }
    if (!data.user) throw new Error('Inscription échouée');

    const { data: profileRow, error: rpcError } = await supabase.rpc('complete_profile', {
      p_display_name: displayName.trim() || SPACE_ROLE_LABEL[spaceType],
      p_space_type: spaceType,
    });

    if (rpcError) {
      set({ authError: rpcError.message });
      await supabase.auth.signOut();
      throw rpcError;
    }

    const profile = mapProfile(profileRow as ProfileRow);
    set({ session: data.session, profile });
    applyProfileToApp(profile);
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
