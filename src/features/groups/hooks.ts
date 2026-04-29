import { useQuery } from '@tanstack/react-query';
import { groupsApi } from './api';
import { Group } from '../../types';

export const useGroups = () => {
  return useQuery<Group[], Error>({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getGroups(),
  });
};
