import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi, PlanProgressPayload, SessionProgressPayload } from '../api/memberApi';

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

export const useGroupPlanSessions = (institution: string, group: string, planId: string) => {
  return useQuery({
    queryKey: memberKeys.sessions(institution, group, planId),
    queryFn: () => memberApi.getGroupPlanSessions(institution, group, planId),
    enabled: !!institution && !!group && !!planId,
  });
};

export const useSessionDetails = (institution: string, group: string, planId: string, sessionId: string) => {
  return useQuery({
    queryKey: memberKeys.session(institution, group, planId, sessionId),
    queryFn: () => memberApi.getSessionDetails(institution, group, planId, sessionId),
    enabled: !!institution && !!group && !!planId && !!sessionId,
  });
};

export const usePlanProgress = (institution: string, group: string, planId: string) => {
  return useQuery({
    queryKey: memberKeys.progress(institution, group, planId),
    queryFn: () => memberApi.getPlanProgress(institution, group, planId),
    enabled: !!institution && !!group && !!planId,
  });
};

export const useUpdatePlanProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      institution, 
      group, 
      planId, 
      payload 
    }: { 
      institution: string; 
      group: string; 
      planId: string; 
      payload: PlanProgressPayload 
    }) => memberApi.updatePlanProgress(institution, group, planId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.progress(variables.institution, variables.group, variables.planId) });
    },
  });
};

export const useUpdateSessionProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      institution, 
      group, 
      planId, 
      sessionId, 
      payload 
    }: { 
      institution: string; 
      group: string; 
      planId: string; 
      sessionId: string; 
      payload: SessionProgressPayload 
    }) => memberApi.updateSessionProgress(institution, group, planId, sessionId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.sessions(variables.institution, variables.group, variables.planId) });
      queryClient.invalidateQueries({ queryKey: memberKeys.session(variables.institution, variables.group, variables.planId, variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: memberKeys.progress(variables.institution, variables.group, variables.planId) });
    },
  });
};
