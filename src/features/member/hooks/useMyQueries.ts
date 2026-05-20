import { useQuery } from '@tanstack/react-query';
import { myApi } from '../api/myApi';
import { useAuthStore } from '../../auth/useAuthStore';

export const myKeys = {
  all: ['my'] as const,
  plans: (institutionId: string, userId: string) => [...myKeys.all, 'plans', institutionId, userId] as const,
  progress: (institutionId: string, userId: string) => [...myKeys.all, 'progress', institutionId, userId] as const,
  notes: (institutionId: string, userId: string) => [...myKeys.all, 'notes', institutionId, userId] as const,
};

export const useMyPlans = () => {
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id;
  const userId = appUser?.user_id;

  return useQuery({
    queryKey: myKeys.plans(institutionId!, userId!),
    queryFn: () => myApi.getMyPlans(institutionId!, userId!),
    enabled: !!institutionId && !!userId,
  });
};

export const useMyProgress = () => {
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id;
  const userId = appUser?.user_id;

  return useQuery({
    queryKey: myKeys.progress(institutionId!, userId!),
    queryFn: () => myApi.getMyProgress(institutionId!, userId!),
    enabled: !!institutionId && !!userId,
  });
};

export const useMyNotes = () => {
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id;
  const userId = appUser?.user_id;

  return useQuery({
    queryKey: myKeys.notes(institutionId!, userId!),
    queryFn: () => myApi.getMyNotes(institutionId!, userId!),
    enabled: !!institutionId && !!userId,
  });
};
