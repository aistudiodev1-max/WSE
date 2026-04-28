import { initialGroups } from '../../data';
import { Group } from '../../types';

export const groupsApi = {
  getGroups: async (): Promise<Group[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(initialGroups), 500);
    });
  },
};
