import { apiClient } from '../../lib/apiClient';
import { initialSessions } from '../../data';
import { Session } from '../../types';

export const sessionsApi = {
  getSessions: async (planId: string, institutionId = 'default', groupId = 'default'): Promise<Session[]> => {
    try {
      // Try v2 member endpoint first
      const data = await apiClient(`/api/v2/institutions/${institutionId}/groups/${groupId}/plans/${planId}/sessions`);
      const sessionsData = data?.sessions || (Array.isArray(data) ? data : null);
      
      if (sessionsData && Array.isArray(sessionsData)) {
        // Map v2 MemberSession to v1 Session if needed
        return sessionsData.map((s: any) => ({
          session_id: s.session_id,
          plan_id: s.plan_id,
          title: s.title,
          order: s.order_index,
          week: Math.ceil(s.order_index / 1), // Simplistic week mapping
          primary_verse: s.primary_verse,
          supporting_verses: s.supporting_verses || [],
          teaching: s.teaching_text || '',
          reflection: s.reflection_prompt || '',
          is_completed: !!s.is_completed,
          completed_at: s.completed_at || null
        }));
      }
      return initialSessions[planId] || [];
    } catch {
      return initialSessions[planId] || [];
    }
  },
};
