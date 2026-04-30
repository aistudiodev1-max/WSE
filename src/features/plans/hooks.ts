import { useQuery } from '@tanstack/react-query';
import { plansApi } from './api';
import { StudyPlan, Assignment } from '../../types';
import { useAuthStore } from '../auth/useAuthStore';

export const usePlans = () => {
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id;
  const groupId = appUser?.group_id || appUser?.church_id;

  return useQuery<StudyPlan[], Error>({
    queryKey: ['plans', institutionId, groupId],
    queryFn: () => plansApi.getPlans(institutionId!, groupId!),
    enabled: !!institutionId && !!groupId,
  });
};

export const useAssignments = () => {
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id;
  const groupId = appUser?.group_id || appUser?.church_id;

  return useQuery<Assignment[], Error>({
    queryKey: ['assignments', institutionId, groupId],
    queryFn: () => plansApi.getAssignments(institutionId!, groupId!),
    enabled: !!institutionId && !!groupId,
  });
};
