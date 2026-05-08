import { apiClient } from '../../lib/apiClient';
import { initialStudyPlans, initialAssignments } from '../../data';
import { StudyPlan, Assignment } from '../../types';

export const plansApi = {
  getPlans: async (institutionId: string, groupId: string): Promise<StudyPlan[]> => {
    try {
      const data = await apiClient(`/api/v2/institutions/${institutionId}/groups/${groupId}/plans`);
      if (data && Array.isArray(data)) {
         return data.map((p: any) => ({
            plan_id: p.plan_id || (p.id ? String(p.id) : 'unknown'),
            title: p.title || p.name || 'Untitled Plan',
            category: p.category || 'General',
            audience: p.audience || 'General',
            difficulty: p.difficulty || 'Beginner',
            plan_type: p.plan_type || 'platform',
            duration_weeks: p.duration_weeks || 1,
            length_sessions: p.length_sessions || 1,
            cadence: p.cadence || 'weekly',
            format_type: p.format_type || 'devotional',
            season_tag: p.season_tag || 'none',
            bible_book_focus: p.bible_book_focus || 'none'
         }));
      }
      return initialStudyPlans;
    } catch {
      return initialStudyPlans;
    }
  },
  getAssignments: async (institutionId: string, groupId: string): Promise<Assignment[]> => {
    try {
      const data = await apiClient(`/api/v2/institutions/${institutionId}/groups/${groupId}/plans`);
      if (data && Array.isArray(data)) {
        return data.map((p: any) => ({
          assignment_id: `assign_${String(p.plan_id || p.id)}`,
          group_id: groupId,
          plan_id: String(p.plan_id || p.id),
          assigned_by: 'system',
          assigned_at: new Date().toISOString()
        }));
      }
      return initialAssignments;
    } catch {
      return initialAssignments;
    }
  },
};
