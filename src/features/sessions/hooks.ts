import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from './api';

export const useSessions = (planId: string) => {
  return useQuery({
    queryKey: ['sessions', planId],
    queryFn: () => sessionsApi.getSessions(planId),
    enabled: !!planId,
  });
};
