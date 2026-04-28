import { useQuery } from '@tanstack/react-query';
import { groupsApi } from './api';

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });
};
