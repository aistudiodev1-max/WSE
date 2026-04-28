'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { initialUsers, initialGroups, initialStudyPlans, initialSessions, initialAssignments, initialProgress, initialNotes } from '../src/data';
import { User, Group, StudyPlan, Session, Assignment, Progress, AppNote, NoteType, Visibility, Permissions } from '../src/types';
import { resolvePermissions, getRoleInGroup } from '../src/utils/permissions';
import { Header } from '../src/components/Header';
import { LeftSidebar } from '../src/components/LeftSidebar';
import { RightSidebar } from '../src/components/RightSidebar';
import { MainContent } from '../src/components/MainContent';
import { EstudyLauncherModal } from '../src/components/EstudyLauncherModal';
import type { EstudySuiteRouteKey } from '../src/utils/estudyUrls';
import { useAuthStore } from '../src/features/auth/useAuthStore';
import { useUIStore } from '../src/store/useUIStore';
import { useNotes, useSaveNote, useDeleteNote } from '../src/features/notes/hooks';
import { useProgress, useSaveProgress } from '../src/features/progress/hooks';
import { usePlans, useAssignments } from '../src/features/plans/hooks';
import { useGroups } from '../src/features/groups/hooks';
import { useSessions } from '../src/features/sessions/hooks';

export default function WisdomStudyPage() {
  const { user, appUser, loading } = useAuthStore();
  const { 
    activeNav, setActiveNav,
    isNotesCollapsed, setNotesCollapsed,
    selectedPlanId, setSelectedPlanId,
    selectedSessionOrder, setSelectedSessionOrder,
    selectedGroupId, setSelectedGroupId,
    activeNoteType, setActiveNoteType,
    noteContent, setNoteContent,
    noteVisibility, setNoteVisibility,
    estudyLauncher, setEstudyLauncher,
    suiteRouteKey, setSuiteRouteKey,
    suitePassageOverride, setSuitePassageOverride
  } = useUIStore();

  // --- Real-time State (React Query Managed) ---
  const { data: notes = [], isLoading: isLoadingNotes } = useNotes();
  const { data: userProgress = [], isLoading: isLoadingProgress } = useProgress();
  const { data: allPlans = [], isLoading: isLoadingPlans } = usePlans();
  const { data: allAssignments = [], isLoading: isLoadingAssignments } = useAssignments();
  const { data: allGroups = [], isLoading: isLoadingGroups } = useGroups();
  const { data: sessions = [], isLoading: isLoadingSessions } = useSessions(selectedPlanId);

  // Mutations
  const saveNoteMutation = useSaveNote();
  const deleteNoteMutation = useDeleteNote();
  const saveProgressMutation = useSaveProgress();

  // --- Computed Context ---
  const currentGroup = useMemo(() => allGroups.find(g => g.group_id === selectedGroupId) || allGroups[0], [allGroups, selectedGroupId]);
  
  const context = useMemo(() => ({
    role_in_group: (appUser && currentGroup) ? getRoleInGroup(appUser, currentGroup) : 'member',
    membership_level: appUser?.membership_level || 'Free',
    licensed: appUser?.licensed ?? true
  }), [appUser, currentGroup]);

  const permissions = useMemo(() => resolvePermissions(context), [context]);

  // --- Data Selectors ---
  const assignedPlans = useMemo(() => {
    const ids = allAssignments.filter(a => a.group_id === selectedGroupId).map(a => a.plan_id);
    return allPlans.filter(p => ids.includes(p.plan_id));
  }, [allAssignments, selectedGroupId, allPlans]);

  const currentPlan = useMemo(() => allPlans.find(p => p.plan_id === selectedPlanId) || assignedPlans[0] || allPlans[0], [selectedPlanId, assignedPlans, allPlans]);
  const currentSession = useMemo(() => sessions.find(s => s.order === selectedSessionOrder) || sessions[0], [sessions, selectedSessionOrder]);

  useEffect(() => {
    setSuitePassageOverride(null);
  }, [currentSession?.session_id, currentPlan?.plan_id, setSuitePassageOverride]);

  const passageForSuite = suitePassageOverride ?? currentSession?.primary_verse ?? '';

  const personalNotes = useMemo(() => notes.filter(n => 
    n.user_id === user?.uid && 
    n.group_id === selectedGroupId && 
    n.plan_id === currentPlan?.plan_id &&
    ((n.note_type === 'plan' && n.session_id === null) || (n.note_type !== 'plan' && n.session_id === currentSession?.session_id))
  ), [notes, user, selectedGroupId, currentPlan, currentSession]);

  const sharedNotes = useMemo(() => notes.filter(n => 
    n.visibility === 'shared_group' && 
    n.user_id !== user?.uid && 
    n.group_id === selectedGroupId && 
    n.plan_id === currentPlan?.plan_id &&
    ((n.note_type === 'plan' && n.session_id === null) || (n.note_type !== 'plan' && n.session_id === currentSession?.session_id))
  ), [notes, user, selectedGroupId, currentPlan, currentSession]);

  const progressPercent = useMemo(() => {
    if (!sessions.length) return 0;
    const completed = userProgress.filter(p => 
      sessions.some(s => s.session_id === p.session_id) && 
      p.status === 'completed'
    ).length;
    return Math.round((completed / sessions.length) * 100);
  }, [userProgress, sessions]);

  // --- Handlers ---
  const handleSaveNote = async () => {
    if (!noteContent.trim() || !user || !currentPlan || !currentSession) return;
    const noteData: AppNote = {
      note_id: `note_${Date.now()}`,
      user_id: user.uid,
      user_name: user.displayName || 'User',
      group_id: selectedGroupId,
      plan_id: currentPlan.plan_id,
      session_id: activeNoteType === 'plan' ? null : currentSession.session_id,
      note_type: activeNoteType,
      content: noteContent,
      verse_id: activeNoteType === 'verse' ? currentSession.primary_verse : '',
      visibility: noteVisibility,
      created_at: new Date().toISOString()
    };
    saveNoteMutation.mutate(noteData);
    setNoteContent('');
  };

  const handleDeleteNote = async (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  const handleComplete = async () => {
    if (!permissions.can_track_progress || !user || !currentSession) return;
    const exists = userProgress.find(p => p.session_id === currentSession.session_id);
    if (!exists) {
      saveProgressMutation.mutate({
        progress_id: `prog_${Date.now()}`,
        user_id: user.uid,
        group_id: selectedGroupId,
        session_id: currentSession.session_id,
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    }
  };

  const openEstudyLauncher = (verseRef: string) =>
    setEstudyLauncher({ open: true, verseRef });
  const closeEstudyLauncher = () => setEstudyLauncher({ open: false, verseRef: '' });

  const selectEstudySuiteInMain = (suite: EstudySuiteRouteKey) => {
    const fromModal = estudyLauncher.verseRef.trim();
    setSuitePassageOverride(fromModal.length > 0 ? fromModal : null);
    setSuiteRouteKey(suite);
    closeEstudyLauncher();
  };

  const isDataLoading = loading || isLoadingNotes || isLoadingProgress || isLoadingPlans || isLoadingAssignments || isLoadingGroups || isLoadingSessions;

  if (isDataLoading) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || !appUser || !currentGroup || !currentPlan || !currentSession) return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
      <p>Please log in to continue or ensure data is available.</p>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 max-h-[100dvh] flex-col overflow-hidden bg-zinc-100 font-sans">
      <EstudyLauncherModal
        open={estudyLauncher.open}
        verseRef={estudyLauncher.verseRef}
        onClose={closeEstudyLauncher}
        onSelectSuite={selectEstudySuiteInMain}
      />
      <Header userName={appUser.user_name} activeNav={activeNav} setActiveNav={setActiveNav} />
      
      <main className="flex min-h-0 flex-1 overflow-hidden">
        <LeftSidebar 
          session={currentSession}
          plan={currentPlan}
          assignedPlans={assignedPlans}
          selectedPlanId={selectedPlanId}
          setSelectedPlan={setSelectedPlanId}
          onComplete={handleComplete}
          progressPercent={progressPercent}
          onOpenEstudyLauncher={openEstudyLauncher}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            <MainContent
              activeNav={activeNav}
              suiteRouteKey={suiteRouteKey}
              passage={passageForSuite}
            />
          </div>
        </div>

        <RightSidebar 
          notes={personalNotes}
          sharedNotes={sharedNotes}
          activeNoteType={activeNoteType}
          setActiveNoteType={setActiveNoteType}
          noteContent={noteContent}
          setNoteContent={setNoteContent}
          noteVisibility={noteVisibility}
          setNoteVisibility={setNoteVisibility}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          isLicensed={appUser.licensed}
          role={context.role_in_group}
          isCollapsed={isNotesCollapsed}
          onToggleCollapse={() => setNotesCollapsed(!isNotesCollapsed)}
        />
      </main>
    </div>
  );
}
