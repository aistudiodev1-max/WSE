import { useQuery } from '@tanstack/react-query';
import { groupsApi } from './api';
import { Group } from '../../types';
import { useAuthStore } from '../auth/useAuthStore';

export const useGroups = () => {
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id;

  return useQuery<Group[], Error>({
    queryKey: ['groups', institutionId],
    queryFn: () => groupsApi.getGroups(institutionId!),
    enabled: !!institutionId,
  });
};

export const useGroup = (groupId: string) => {
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id;

  return useQuery<Group | null, Error>({
    queryKey: ['groups', institutionId, groupId],
    queryFn: () => groupsApi.getGroup(institutionId!, groupId),
    enabled: !!institutionId && !!groupId,
  });
};
