import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from './api';
import { Session } from '../../types';
import { useAuthStore } from '../auth/useAuthStore';

export const useSessions = (planId: string) => {
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id || 'default';
  const groupId = appUser?.group_id || 'default';

  return useQuery<Session[], Error>({
    queryKey: ['sessions', planId, institutionId, groupId],
    queryFn: () => sessionsApi.getSessions(planId, institutionId, groupId),
    enabled: !!planId,
  });
};
