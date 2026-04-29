import { apiClient } from '../../lib/apiClient';
import { initialSessions } from '../../data';
import { Session } from '../../types';

export const sessionsApi = {
  getSessions: async (planId: string, institutionId = 'default', groupId = 'default'): Promise<Session[]> => {
    try {
      const data = await apiClient(`/institutions/${institutionId}/groups/${groupId}/plans/${planId}/sessions`);
      if (data && Array.isArray(data)) return data;
      return initialSessions[planId] || [];
    } catch {
      return initialSessions[planId] || [];
    }
  },
};
