import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal, GoalLevel, PillarId, SpaceType, SwotAnalysis, SmartValidation } from '../types';
import type { AppView } from '../types/premium';
import { generateId } from '../lib/progress';
import { celebrateMajorGoal } from '../lib/celebration';
import { sanitizeDescription, sanitizeSwotField, sanitizeTitle } from '../lib/sanitize';
import { applyRecurrenceResets } from '../lib/recurrence';
import { usePingStore } from './usePingStore';
import { isSpaceAllowed } from '../lib/auth';
import { getAuthContext } from '../lib/session';
import {
  deleteGoalFromDb,
  fetchAllGoals,
  insertGoal,
  isSupabaseConfigured,
  testConnection,
  updateGoalInDb,
} from '../lib/supabase';

interface VisionWizardData {
  title: string;
  description: string;
  pillarId: PillarId;
  swot: SwotAnalysis;
  smart: SmartValidation;
  inspirationImageUrl?: string;
}

interface AppState {
  currentSpace: SpaceType;
  currentView: AppView;
  goals: Goal[];
  wizardOpen: boolean;
  selectedGoalId: string | null;
  expandedLevels: Record<string, boolean>;
  isLoading: boolean;
  isConnected: boolean;
  syncError: string | null;

  setCurrentSpace: (space: SpaceType) => void;
  setCurrentView: (view: AppView) => void;
  setGoals: (goals: Goal[]) => void;
  setSelectedGoal: (id: string | null) => void;
  toggleExpanded: (goalId: string) => void;
  openWizard: () => void;
  closeWizard: () => void;
  loadGoals: () => Promise<void>;

  createVision: (space: SpaceType, data: VisionWizardData) => Promise<void>;
  addGoal: (
    parentId: string,
    level: GoalLevel,
    title: string,
    extras?: Partial<Goal>
  ) => Promise<void>;
  addSuggestedGoals: (parentId: string, suggestions: { title: string; level: GoalLevel }[]) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  getGoalsBySpace: (space: SpaceType) => Goal[];
  getRootVisions: (space: SpaceType) => Goal[];
}

const defaultSmart: SmartValidation = {
  specific: false,
  measurable: false,
  achievable: false,
  realistic: false,
  timeBound: false,
};

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(15);
  return d.toISOString();
}

function createDemoGoals(): Goal[] {
  const now = new Date().toISOString();
  const sharedVision: Goal = {
    id: 'demo-shared-vision',
    parentId: null,
    spaceType: 'shared',
    level: 'global_vision',
    pillarId: 'couple_famille',
    title: 'Construire notre foyer dans 2 ans',
    description: 'Acheter et aménager notre première maison ensemble',
    completed: false,
    swot: {
      strengths: 'Double revenu, bonne épargne, soutien familial',
      weaknesses: "Marché immobilier tendu, peu d'expérience",
      opportunities: 'Baisse des taux, aides primo-accédants',
      threats: 'Inflation, instabilité économique',
    },
    smart: { specific: true, measurable: true, achievable: true, realistic: true, timeBound: true },
    inspirationImageUrl:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop',
    createdAt: now,
    updatedAt: now,
  };

  const annual1: Goal = {
    id: 'demo-annual-1',
    parentId: sharedVision.id,
    spaceType: 'shared',
    level: 'annual',
    pillarId: 'couple_famille',
    title: 'Année 1 — Épargne et recherche',
    description: "Constituer l'apport et identifier les zones cibles",
    completed: false,
    periodLabel: 'Année 1',
    createdAt: now,
    updatedAt: now,
  };

  const quarterly1: Goal = {
    id: 'demo-quarterly-1',
    parentId: annual1.id,
    spaceType: 'shared',
    level: 'quarterly',
    pillarId: 'couple_famille',
    title: 'T1 — Définir budget et critères',
    description: '',
    completed: true,
    periodLabel: 'T1',
    createdAt: now,
    updatedAt: now,
  };

  const userAVision: Goal = {
    id: 'demo-user-a-vision',
    parentId: null,
    spaceType: 'user_a',
    level: 'global_vision',
    pillarId: 'carriere',
    title: 'Devenir lead developer',
    description: 'Évoluer vers un poste de lead technique en 2 ans',
    completed: false,
    swot: {
      strengths: 'Solides bases techniques, autonomie',
      weaknesses: "Peu d'expérience management",
      opportunities: 'Demande forte, formations internes',
      threats: 'Concurrence, évolution rapide des technos',
    },
    smart: { specific: true, measurable: true, achievable: true, realistic: true, timeBound: true },
    createdAt: now,
    updatedAt: now,
  };

  const financeVision: Goal = {
    id: 'demo-finance-vision',
    parentId: null,
    spaceType: 'shared',
    level: 'global_vision',
    pillarId: 'financier',
    title: 'Sécuriser notre patrimoine',
    description: 'Épargne, investissements et indépendance financière à 2 ans',
    completed: false,
    smart: { specific: true, measurable: true, achievable: true, realistic: true, timeBound: true },
    createdAt: monthsAgo(5),
    updatedAt: monthsAgo(5),
  };

  const financeAnnual: Goal = {
    id: 'demo-finance-annual',
    parentId: financeVision.id,
    spaceType: 'shared',
    level: 'annual',
    pillarId: 'financier',
    title: 'Constituer un fonds d\'urgence',
    description: '',
    completed: true,
    periodLabel: 'Année 1',
    createdAt: monthsAgo(5),
    updatedAt: monthsAgo(4),
  };

  const financeQuarterly: Goal = {
    id: 'demo-finance-quarterly',
    parentId: financeAnnual.id,
    spaceType: 'shared',
    level: 'quarterly',
    pillarId: 'financier',
    title: 'Automatiser l\'épargne mensuelle',
    description: '',
    completed: true,
    periodLabel: 'T1',
    createdAt: monthsAgo(4),
    updatedAt: monthsAgo(2),
  };

  const financeMonthly: Goal = {
    id: 'demo-finance-monthly',
    parentId: financeQuarterly.id,
    spaceType: 'shared',
    level: 'monthly',
    pillarId: 'financier',
    title: 'Ouvrir un PEA',
    description: '',
    completed: false,
    periodLabel: 'Mars',
    createdAt: monthsAgo(2),
    updatedAt: monthsAgo(2),
  };

  const financeWeekly: Goal = {
    id: 'demo-finance-weekly',
    parentId: financeMonthly.id,
    spaceType: 'shared',
    level: 'weekly',
    pillarId: 'financier',
    title: 'Comparer les frais de gestion',
    description: '',
    completed: true,
    createdAt: monthsAgo(1),
    updatedAt: monthsAgo(0),
  };

  const financeDaily: Goal = {
    id: 'demo-finance-daily',
    parentId: financeWeekly.id,
    spaceType: 'shared',
    level: 'daily',
    pillarId: 'financier',
    title: 'Vérifier le budget du jour',
    description: '',
    completed: false,
    recurrence: 'weekly',
    createdAt: monthsAgo(0),
    updatedAt: monthsAgo(0),
  };

  const financeBlock1: Goal = {
    id: 'demo-finance-block-1',
    parentId: financeDaily.id,
    spaceType: 'shared',
    level: 'time_block',
    pillarId: 'financier',
    title: 'Revue des comptes',
    description: '',
    completed: false,
    startTime: '09:00',
    endTime: '09:30',
    createdAt: monthsAgo(0),
    updatedAt: monthsAgo(0),
  };

  const financeBlock2: Goal = {
    id: 'demo-finance-block-2',
    parentId: financeDaily.id,
    spaceType: 'shared',
    level: 'time_block',
    pillarId: 'financier',
    title: 'Épargne automatique',
    description: '',
    completed: false,
    startTime: '18:00',
    endTime: '18:15',
    recurrence: 'monthly',
    createdAt: monthsAgo(0),
    updatedAt: monthsAgo(0),
  };

  return [
    sharedVision,
    annual1,
    quarterly1,
    userAVision,
    financeVision,
    financeAnnual,
    financeQuarterly,
    financeMonthly,
    financeWeekly,
    financeDaily,
    financeBlock1,
    financeBlock2,
  ];
}

async function syncInsert(goal: Goal, set: (fn: (s: AppState) => Partial<AppState>) => void) {
  if (!isSupabaseConfigured) return;
  try {
    await insertGoal(goal);
    set(() => ({ syncError: null }));
  } catch (err) {
    set(() => ({ syncError: err instanceof Error ? err.message : 'Erreur de synchronisation' }));
  }
}

async function syncUpdate(goal: Goal, set: (fn: (s: AppState) => Partial<AppState>) => void) {
  if (!isSupabaseConfigured) return;
  try {
    await updateGoalInDb(goal);
    set(() => ({ syncError: null }));
  } catch (err) {
    set(() => ({ syncError: err instanceof Error ? err.message : 'Erreur de synchronisation' }));
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentSpace: 'shared',
      currentView: 'home',
      goals: isSupabaseConfigured ? [] : createDemoGoals(),
      wizardOpen: false,
      selectedGoalId: null,
      expandedLevels: {},
      isLoading: isSupabaseConfigured,
      isConnected: false,
      syncError: null,

      setCurrentSpace: (space) => {
        if (isSupabaseConfigured) {
          const { profileSpace } = getAuthContext();
          if (profileSpace && !isSpaceAllowed(profileSpace, space)) return;
        }
        set({ currentSpace: space, selectedGoalId: null });
      },
      setCurrentView: (view) => set({ currentView: view }),
      setGoals: (goals) => set({ goals }),
      setSelectedGoal: (id) => set({ selectedGoalId: id }),
      toggleExpanded: (goalId) =>
        set((s) => ({
          expandedLevels: { ...s.expandedLevels, [goalId]: !s.expandedLevels[goalId] },
        })),
      openWizard: () => set({ wizardOpen: true }),
      closeWizard: () => set({ wizardOpen: false }),

      loadGoals: async () => {
        if (!isSupabaseConfigured) {
          set({ isLoading: false, isConnected: false });
          return;
        }

        const { hasSession, profileSpace } = getAuthContext();
        if (!hasSession || !profileSpace) {
          set({ isLoading: false, isConnected: false, goals: [] });
          return;
        }

        set({ isLoading: true, syncError: null });

        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Délai de connexion dépassé (10s)')), 10000)
        );

        try {
          await Promise.race([
            (async () => {
              const connected = await testConnection();
              if (!connected) {
                throw new Error(
                  'Impossible de se connecter à Supabase. Vérifiez le schéma SQL et les clés API.'
                );
              }
              const fetched = await fetchAllGoals();
              const goals = applyRecurrenceResets(fetched);
              set({ goals, isLoading: false, isConnected: true, syncError: null });
            })(),
            timeout,
          ]);
        } catch (err) {
          set({
            isLoading: false,
            isConnected: false,
            syncError: err instanceof Error ? err.message : 'Erreur de chargement',
          });
        }
      },

      createVision: async (space, data) => {
        const now = new Date().toISOString();
        const vision: Goal = {
          id: generateId(),
          parentId: null,
          spaceType: space,
          level: 'global_vision',
          pillarId: data.pillarId,
          title: sanitizeTitle(data.title),
          description: sanitizeDescription(data.description),
          completed: false,
          swot: {
            strengths: sanitizeSwotField(data.swot.strengths),
            weaknesses: sanitizeSwotField(data.swot.weaknesses),
            opportunities: sanitizeSwotField(data.swot.opportunities),
            threats: sanitizeSwotField(data.swot.threats),
          },
          smart: data.smart,
          inspirationImageUrl: data.inspirationImageUrl,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ goals: [...s.goals, vision], wizardOpen: false }));
        await syncInsert(vision, set);
      },

      addGoal: async (parentId, level, title, extras = {}) => {
        const parent = get().goals.find((g) => g.id === parentId);
        if (!parent) return;
        const now = new Date().toISOString();
        const goal: Goal = {
          id: generateId(),
          parentId,
          spaceType: parent.spaceType,
          level,
          pillarId: parent.pillarId,
          title: sanitizeTitle(title),
          description: '',
          completed: false,
          createdAt: now,
          updatedAt: now,
          ...extras,
        };
        set((s) => ({ goals: [...s.goals, goal] }));
        await syncInsert(goal, set);
      },

      addSuggestedGoals: async (parentId, suggestions) => {
        for (const s of suggestions) {
          await get().addGoal(parentId, s.level, s.title);
        }
      },

      toggleGoal: async (id) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;

        const newCompleted = !goal.completed;
        const now = new Date().toISOString();
        const updated: Goal = {
          ...goal,
          completed: newCompleted,
          updatedAt: now,
          recurrenceCompletedAt:
            newCompleted && (goal.recurrence === 'weekly' || goal.recurrence === 'monthly')
              ? now
              : goal.recurrenceCompletedAt,
        };

        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? updated : g)),
        }));

        if (newCompleted) {
          if (
            goal.spaceType !== 'shared' &&
            (goal.level === 'daily' || goal.level === 'time_block' || goal.level === 'weekly')
          ) {
            usePingStore.getState().recordPartnerCompletion(goal.spaceType, goal.title);
          }

          const isMajor =
            goal.level === 'global_vision' ||
            goal.level === 'annual' ||
            (goal.spaceType === 'shared' && goal.level === 'quarterly');
          if (isMajor) {
            void celebrateMajorGoal(goal.spaceType === 'shared');
          }
        }

        await syncUpdate(updated, set);
      },

      updateGoal: async (id, updates) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;

        const safeUpdates = { ...updates };
        if (typeof safeUpdates.title === 'string') safeUpdates.title = sanitizeTitle(safeUpdates.title);
        if (typeof safeUpdates.description === 'string') {
          safeUpdates.description = sanitizeDescription(safeUpdates.description);
        }

        const updated: Goal = { ...goal, ...safeUpdates, updatedAt: new Date().toISOString() };
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? updated : g)),
        }));
        await syncUpdate(updated, set);
      },

      deleteGoal: async (id) => {
        const toDelete = new Set<string>();
        const collect = (goalId: string) => {
          toDelete.add(goalId);
          get().goals.filter((g) => g.parentId === goalId).forEach((g) => collect(g.id));
        };
        collect(id);

        set((s) => ({ goals: s.goals.filter((g) => !toDelete.has(g.id)) }));

        if (isSupabaseConfigured) {
          try {
            await deleteGoalFromDb(id);
            set({ syncError: null });
          } catch (err) {
            set({ syncError: err instanceof Error ? err.message : 'Erreur de suppression' });
            await get().loadGoals();
          }
        }
      },

      getGoalsBySpace: (space) => get().goals.filter((g) => g.spaceType === space),
      getRootVisions: (space) =>
        get().goals.filter((g) => g.spaceType === space && g.level === 'global_vision'),
    }),
    {
      name: 'visiondual-storage',
      partialize: (state) => ({
        currentSpace: state.currentSpace,
        currentView: state.currentView,
        ...(!isSupabaseConfigured ? { goals: state.goals } : {}),
      }),
    }
  )
);

export { defaultSmart };
