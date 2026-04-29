import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from './api';
import { Progress } from '../../types';

export const useProgress = () => {
  return useQuery<Progress[], Error>({
    queryKey: ['progress'],
    queryFn: () => progressApi.getProgress(),
  });
};

export const useSaveProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (progress: Progress) => progressApi.saveProgress(progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
};
