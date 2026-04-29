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
    closeEstudyLauncher();
  };

  if (isDataLoading) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || !appUser) return null;

  const showEmbedOverlay = isEmbed && !suitePassageOverride;

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

        {showEmbedOverlay && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-100/90 backdrop-blur-sm p-4 text-center">
            <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl p-8 border border-zinc-200">
               <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-6">
                 <BookOpen size={32} />
               </div>
               <h3 className="text-xl font-black text-brand-dark mb-2">Interact with Verses</h3>
               <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                 Select a verse to explore context, parallel translations, and original languages in the Wisdom Study Suite.
               </p>
               <button
                 onClick={() => setEstudyLauncher({ open: true, verseRef: '' })}
                 className="w-full bg-brand-dark text-white font-bold py-4 px-6 rounded-2xl hover:bg-brand-dark/90 transition transform active:scale-95 shadow-lg shadow-brand-dark/20"
               >
                 Open Study Suite
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
