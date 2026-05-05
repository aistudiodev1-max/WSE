'use client';

import React from 'react';
import { Header } from '../src/components/Header';
import { GroupSelection } from '../src/components/GroupSelection';
import { StudyEngine } from '../src/components/StudyEngine';
import { EstudyLauncherModal } from '../src/components/EstudyLauncherModal';
import { useAuthStore } from '../src/features/auth/useAuthStore';
import { useUIStore } from '../src/store/useUIStore';
import { EstudySuiteRouteKey } from '../src/utils/estudyUrls';

export default function WisdomStudyPage() {
  const { user, appUser, loading } = useAuthStore();
  const { 
    estudyLauncher,
    setEstudyLauncher,
    setSuiteRouteKey,
    setSuitePassageOverride,
    selectedGroupId
  } = useUIStore();

  React.useEffect(() => {
    if (!loading && (!user || !appUser) && typeof window !== 'undefined') {
      window.location.href = process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL || 'http://localhost:8000';
    }
  }, [user, appUser, loading]);

  const closeEstudyLauncher = () => setEstudyLauncher({ open: false, verseRef: '' });

  const selectEstudySuiteInMain = (suite: EstudySuiteRouteKey) => {
    const fromModal = estudyLauncher.verseRef.trim();
    setSuitePassageOverride(fromModal.length > 0 ? fromModal : null);
    setSuiteRouteKey(suite);
    useUIStore.getState().setHasInteractedWithVerse(true);
    closeEstudyLauncher();
  };

  if (loading) return (
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
      
      {!selectedGroupId ? (
        <GroupSelection />
      ) : (
        <StudyEngine />
      )}
    </div>
  );
}
