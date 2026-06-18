import { useEffect } from 'react';
import { MobileTopBar } from './components/layout/MobileTopBar';
import { BottomNav } from './components/layout/BottomNav';
import { Fab } from './components/layout/Fab';
import { Dashboard } from './components/dashboard/Dashboard';
import { FocusDay } from './components/focus/FocusDay';
import { EisenhowerMatrix } from './components/eisenhower/EisenhowerMatrix';
import { VisionWizard } from './components/wizard/VisionWizard';
import { PingOverlay } from './components/encouragement/PingOverlay';
import { EncourageButton } from './components/encouragement/EncourageButton';
import { AuthScreen } from './components/auth/AuthScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useStore } from './store/useStore';
import { useAuthStore } from './store/useAuthStore';
import { usePingStore } from './store/usePingStore';
import { setupAutoThemeListener } from './store/useThemeStore';
import { applyRecurrenceResets } from './lib/recurrence';

function MainView() {
  const currentView = useStore((s) => s.currentView);
  if (currentView === 'focus') return <FocusDay />;
  if (currentView === 'eisenhower') return <EisenhowerMatrix />;
  return <Dashboard />;
}

function AppShell() {
  const loadGoals = useStore((s) => s.loadGoals);
  const currentView = useStore((s) => s.currentView);
  const currentSpace = useStore((s) => s.currentSpace);
  const consumePingsFor = usePingStore((s) => s.consumePingsFor);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    const { goals, setGoals } = useStore.getState();
    const next = applyRecurrenceResets(goals);
    if (next !== goals) setGoals(next);

    const id = window.setInterval(() => {
      const state = useStore.getState();
      const reset = applyRecurrenceResets(state.goals);
      if (reset !== state.goals) state.setGoals(reset);
    }, 60_000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    consumePingsFor(currentSpace);
  }, [currentSpace, consumePingsFor]);

  return (
    <div className="mobile-shell">
      <MobileTopBar />
      <main className="mobile-scroll pb-32">
        <MainView />
      </main>
      {currentView === 'home' && <Fab />}
      <EncourageButton />
      <BottomNav />
      <VisionWizard />
      <PingOverlay />
    </div>
  );
}

export default function App() {
  const initAuth = useAuthStore((s) => s.init);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    setupAutoThemeListener();
    initAuth();
  }, [initAuth]);

  const needsAuth = !isAuthLoading && (!session || !profile);

  if (isAuthLoading) {
    return (
      <div className="mobile-shell min-h-[100dvh] flex items-center justify-center">
        <p className="text-sm text-aw-faint">Chargement…</p>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <ErrorBoundary>
        <AuthScreen />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
