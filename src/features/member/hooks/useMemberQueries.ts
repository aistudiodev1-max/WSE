import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi, PlanProgressPayload, SessionProgressPayload } from '../api/memberApi';
import { useAuthStore } from '../../auth/useAuthStore';

export const memberKeys = {
  all: ['member'] as const,
  profile: () => [...memberKeys.all, 'profile'] as const,
  sessions: (institution: string, group: string, planId: string) => 
    [...memberKeys.all, 'sessions', institution, group, planId] as const,
  session: (institution: string, group: string, planId: string, sessionId: string) => 
    [...memberKeys.all, 'session', institution, group, planId, sessionId] as const,
  progress: (institution: string, group: string, planId: string) => 
    [...memberKeys.all, 'progress', institution, group, planId] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: memberKeys.profile(),
    queryFn: () => memberApi.getProfile(),
  });
};

export const useGroupPlanSessions = (planId: string) => {
  const appUser = useAuthStore((state) => state.appUser);
  const institution = appUser?.church_id;
  const group = appUser?.group_id || appUser?.church_id;

  return useQuery({
    queryKey: memberKeys.sessions(institution!, group!, planId),
    queryFn: () => memberApi.getGroupPlanSessions(institution!, group!, planId),
    enabled: !!institution && !!group && !!planId,
  });
};

export const useSessionDetails = (planId: string, sessionId: string) => {
  const appUser = useAuthStore((state) => state.appUser);
  const institution = appUser?.church_id;
  const group = appUser?.group_id || appUser?.church_id;

  return useQuery({
    queryKey: memberKeys.session(institution!, group!, planId, sessionId),
    queryFn: () => memberApi.getSessionDetails(institution!, group!, planId, sessionId),
    enabled: !!institution && !!group && !!planId && !!sessionId,
  });
};

export const usePlanProgress = (planId: string) => {
  const appUser = useAuthStore((state) => state.appUser);
  const institution = appUser?.church_id;
  const group = appUser?.group_id || appUser?.church_id;

  return useQuery({
    queryKey: memberKeys.progress(institution!, group!, planId),
    queryFn: () => memberApi.getPlanProgress(institution!, group!, planId),
    enabled: !!institution && !!group && !!planId,
  });
};

export const useUpdatePlanProgress = () => {
  const queryClient = useQueryClient();
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id;
  const groupId = appUser?.group_id || appUser?.church_id;

  return useMutation({
    mutationFn: ({ 
      planId, 
      payload 
    }: { 
      planId: string; 
      payload: PlanProgressPayload 
    }) => memberApi.updatePlanProgress(institutionId!, groupId!, planId, payload),
    onSuccess: (_, variables) => {
      if (institutionId && groupId) {
        queryClient.invalidateQueries({ queryKey: memberKeys.progress(institutionId, groupId, variables.planId) });
      }
    },
  });
};

export const useUpdateSessionProgress = () => {
  const queryClient = useQueryClient();
  const appUser = useAuthStore((state) => state.appUser);
  const institutionId = appUser?.church_id;
  const groupId = appUser?.group_id || appUser?.church_id;

  return useMutation({
    mutationFn: ({ 
      planId, 
      sessionId, 
      payload 
    }: { 
      planId: string; 
      sessionId: string; 
      payload: SessionProgressPayload 
    }) => memberApi.updateSessionProgress(institutionId!, groupId!, planId, sessionId, payload),
    onSuccess: (_, variables) => {
      if (institutionId && groupId) {
        queryClient.invalidateQueries({ queryKey: memberKeys.sessions(institutionId, groupId, variables.planId) });
        queryClient.invalidateQueries({ queryKey: memberKeys.session(institutionId, groupId, variables.planId, variables.sessionId) });
        queryClient.invalidateQueries({ queryKey: memberKeys.progress(institutionId, groupId, variables.planId) });
      }
    },
  });
};
