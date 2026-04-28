import { useQuery } from '@tanstack/react-query';
import { plansApi } from './api';

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: plansApi.getPlans,
  });
};

export const useAssignments = () => {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: plansApi.getAssignments,
  });
};
