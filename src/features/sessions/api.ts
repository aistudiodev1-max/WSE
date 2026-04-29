import { apiClient } from '../../lib/apiClient';
import { initialSessions } from '../../data';
import { Session } from '../../types';

export const sessionsApi = {
  getSessions: async (planId: string, institutionId = 'default', groupId = 'default'): Promise<Session[]> => {
    try {
      // Try v2 member endpoint first
      const data = await apiClient(`/api/v2/institutions/${institutionId}/groups/${groupId}/plans/${planId}/sessions`);
      if (data && Array.isArray(data)) {
        // Map v2 MemberSession to v1 Session if needed
        return data.map((s: any) => ({
          session_id: s.session_id,
          plan_id: s.plan_id,
          title: s.title,
          order: s.order_index,
          week: Math.ceil(s.order_index / 1), // Simplistic week mapping
          primary_verse: s.primary_verse,
          supporting_verses: s.supporting_verses || [],
          teaching: s.teaching_text || '',
          reflection: s.reflection_prompt || ''
        }));
      }
      return initialSessions[planId] || [];
    } catch {
      return initialSessions[planId] || [];
    }
  },
};
