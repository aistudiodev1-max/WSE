import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from './api';
import { Progress } from '../../types';
import { useAuthStore } from '../auth/useAuthStore';
import { useUIStore } from '../../store/useUIStore';

export const useProgress = (planId: string | null = null) => {
  const appUser = useAuthStore((state) => state.appUser);
  const selectedGroupId = useUIStore((state) => state.selectedGroupId);
  const institutionId = appUser?.church_id;
  const groupId = selectedGroupId || appUser?.group_id || appUser?.church_id;

  return useQuery<Progress[], Error>({
    queryKey: ['progress', institutionId, groupId, planId],
    queryFn: () => progressApi.getProgress(institutionId!, groupId!, planId!),
    enabled: !!institutionId && !!groupId && !!planId,
  });
};

export const useSaveProgress = (sessionsCount = 1, completedCount = 0) => {
  const queryClient = useQueryClient();
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id;

  return useMutation({
    mutationFn: ({ progress, planId }: { progress: Progress, planId: string }) => progressApi.saveProgress(progress, institutionId!, planId, sessionsCount, completedCount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      // Also invalidate with specific keys if needed
      queryClient.invalidateQueries({ queryKey: ['progress', institutionId, variables.progress.group_id] });
    },
  });
};
