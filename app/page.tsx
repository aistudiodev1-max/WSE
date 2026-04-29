'use client';

import React from 'react';
import { Header } from '../src/components/Header';
import { LeftSidebar } from '../src/components/LeftSidebar';
import { RightSidebar } from '../src/components/RightSidebar';
import { MainContent } from '../src/components/MainContent';
import { EstudyLauncherModal } from '../src/components/EstudyLauncherModal';
import { useAuthStore } from '../src/features/auth/useAuthStore';
import { useUIStore } from '../src/store/useUIStore';
import { useNotes } from '../src/features/notes/hooks';
import { useProgress } from '../src/features/progress/hooks';
import { usePlans, useAssignments } from '../src/features/plans/hooks';
import { useGroups } from '../src/features/groups/hooks';
import { useSessions } from '../src/features/sessions/hooks';
import { EstudySuiteRouteKey } from '../src/utils/estudyUrls';
import { BookOpen } from 'lucide-react';

export default function WisdomStudyPage() {
  const { user, appUser, loading } = useAuthStore();
  const { 
    estudyLauncher,
    setEstudyLauncher,
    setSuiteRouteKey,
    setSuitePassageOverride,
    isEmbed,
    suitePassageOverride
  } = useUIStore();

  React.useEffect(() => {
    if (!loading && (!user || !appUser) && typeof window !== 'undefined') {
      window.location.href = 'http://localhost:8000';
    }
  }, [user, appUser, loading]);

  const { isLoading: isLoadingNotes } = useNotes();
  const { isLoading: isLoadingProgress } = useProgress();
  const { isLoading: isLoadingPlans } = usePlans();
  const { isLoading: isLoadingAssignments } = useAssignments();
  const { isLoading: isLoadingGroups } = useGroups();
  const { isLoading: isLoadingSessions } = useSessions(useUIStore.getState().selectedPlanId);

  const isDataLoading = loading || isLoadingNotes || isLoadingProgress || isLoadingPlans || isLoadingAssignments || isLoadingGroups || isLoadingSessions;

  const closeEstudyLauncher = () => setEstudyLauncher({ open: false, verseRef: '' });

  const selectEstudySuiteInMain = (suite: EstudySuiteRouteKey) => {
    const fromModal = estudyLauncher.verseRef.trim();
    setSuitePassageOverride(fromModal.length > 0 ? fromModal : null);
    setSuiteRouteKey(suite);
    useUIStore.getState().setHasInteractedWithVerse(true);
    closeEstudyLauncher();
  };

  if (isDataLoading) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || !appUser) return null;

  return (
    <div className="flex h-full min-h-0 max-h-[100dvh] flex-col overflow-hidden bg-zinc-100 font-sans">
      <EstudyLauncherModal
        open={estudyLauncher.open}
        verseRef={estudyLauncher.verseRef}
        onClose={closeEstudyLauncher}
        onSelectSuite={selectEstudySuiteInMain}
      />
      <Header />
      
      <main className="flex min-h-0 flex-1 overflow-hidden relative">
        {!isEmbed && <LeftSidebar />}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            <MainContent />
          </div>
        </div>

        {!isEmbed && <RightSidebar />}
      </main>
    </div>
  );
}
