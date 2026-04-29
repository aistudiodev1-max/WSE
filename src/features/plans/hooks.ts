import { useQuery } from '@tanstack/react-query';
import { plansApi } from './api';
import { StudyPlan, Assignment } from '../../types';

export const usePlans = () => {
  return useQuery<StudyPlan[], Error>({
    queryKey: ['plans'],
    queryFn: () => plansApi.getPlans(),
  });
};

export const useAssignments = () => {
  return useQuery<Assignment[], Error>({
    queryKey: ['assignments'],
    queryFn: () => plansApi.getAssignments(),
  });
};
