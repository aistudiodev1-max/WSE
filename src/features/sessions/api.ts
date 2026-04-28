import { initialSessions } from '../../data';
import { Session } from '../../types';

export const sessionsApi = {
  getSessions: async (planId: string): Promise<Session[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(initialSessions[planId] || []), 500);
    });
  },
};
