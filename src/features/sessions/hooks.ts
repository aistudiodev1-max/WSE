import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from './api';
import { Session } from '../../types';
import { useAuthStore } from '../auth/useAuthStore';
import { useUIStore } from '../../store/useUIStore';

export const useSessions = (planId: string) => {
  const appUser = useAuthStore((state) => state.appUser);
  const selectedGroupId = useUIStore((state) => state.selectedGroupId);
  const institutionId = appUser?.church_id;
  const groupId = selectedGroupId || appUser?.group_id || appUser?.church_id;

  return useQuery<Session[], Error>({
    queryKey: ['sessions', planId, institutionId, groupId],
    queryFn: () => sessionsApi.getSessions(planId, institutionId!, groupId!),
    enabled: !!planId && !!institutionId && !!groupId,
  });
};
