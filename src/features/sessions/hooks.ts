import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from './api';
import { Session } from '../../types';

export const useSessions = (planId: string) => {
  return useQuery<Session[], Error>({
    queryKey: ['sessions', planId],
    queryFn: () => sessionsApi.getSessions(planId),
    enabled: !!planId,
  });
};
