import React from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MainContent } from './MainContent';
import { useNotes } from '../features/notes/hooks';
import { useProgress } from '../features/progress/hooks';
import { usePlans, useAssignments } from '../features/plans/hooks';
import { useMyGroups } from '../features/groups/hooks';
import { useSessions } from '../features/sessions/hooks';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../features/auth/useAuthStore';

export const StudyEngine: React.FC = () => {
  const { appUser } = useAuthStore();
  const selectedPlanId = useUIStore((state) => state.selectedPlanId);
  const selectedGroupId = useUIStore((state) => state.selectedGroupId);
  const institutionId = appUser?.church_id;

  const { isLoading: isLoadingNotes } = useNotes(institutionId, selectedGroupId ?? undefined);
  const { isLoading: isLoadingProgress } = useProgress(selectedPlanId);
  const { isLoading: isLoadingPlans } = usePlans();
  const { isLoading: isLoadingAssignments } = useAssignments();
  const { isLoading: isLoadingGroups } = useMyGroups();
  const { isLoading: isLoadingSessions } = useSessions(selectedPlanId);

  const isDataLoading = false; // Disable global loading block so the UI renders fully and components handle their own empty/loading states to avoid deadlock

  // Optional: keeping the vars to avoid unused variables error, or just let them be.
  const loadingState = isLoadingNotes || isLoadingProgress || isLoadingPlans || isLoadingAssignments || isLoadingGroups || isLoadingSessions;

  if (isDataLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-brand-dark">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 overflow-hidden relative">
      <LeftSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <MainContent />
        </div>
      </div>
      <RightSidebar />
    </main>
  );
};
