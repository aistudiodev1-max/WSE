import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from './api';
import { Progress } from '../../types';
import { useAuthStore } from '../auth/useAuthStore';

export const useProgress = (planId = 'default') => {
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id || 'default';
  const groupId = appUser?.group_id || 'default';

  return useQuery<Progress[], Error>({
    queryKey: ['progress', institutionId, groupId, planId],
    queryFn: () => progressApi.getProgress(institutionId, groupId, planId),
  });
};

export const useSaveProgress = () => {
  const queryClient = useQueryClient();
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id || 'default';

  return useMutation({
    mutationFn: (progress: Progress) => progressApi.saveProgress(progress, institutionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      // Also invalidate with specific keys if needed
      queryClient.invalidateQueries({ queryKey: ['progress', institutionId, variables.group_id] });
    },
  });
};
