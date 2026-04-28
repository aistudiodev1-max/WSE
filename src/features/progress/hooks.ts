import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from './api';

export const useProgress = () => {
  return useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.getProgress,
  });
};

export const useSaveProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: progressApi.saveProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
};
