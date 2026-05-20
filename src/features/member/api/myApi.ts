import { apiClient } from '../../../lib/apiClient';
import { 
  initialGroups, 
  initialAssignments, 
  initialProgress, 
  initialSessions, 
  initialStudyPlans, 
  initialNotes 
} from '../../../data';
import { Group, StudyPlan, AppNote, Progress } from '../../../types';

export const myApi = {
  // /api/v2/institutions/:id/plans/my
  getMyPlans: async (institutionId: string, userId: string): Promise<any[]> => {
    // skip try/catch API call, go straight to mock data return for now
    const myGroups = initialGroups.filter(g => g.members.includes(userId) && g.church_id === institutionId);
    const groupIds = myGroups.map(g => g.group_id);
    const myAssignments = initialAssignments.filter(a => groupIds.includes(a.group_id));
    
    return myAssignments.map(a => {
        const plan = initialStudyPlans.find(p => p.plan_id === a.plan_id);
        const group = myGroups.find(g => g.group_id === a.group_id);
        return { assignment: a, plan, group };
    }).filter(p => !!p.plan && !!p.group);
  },

  // /api/v2/institutions/:id/progress/my
  getMyProgress: async (institutionId: string, userId: string): Promise<Progress[]> => {
    return initialProgress.filter(p => p.user_id === userId);
  },

  // /api/v2/institutions/:id/notes/my
  getMyNotes: async (institutionId: string, userId: string): Promise<AppNote[]> => {
    return initialNotes.filter(n => n.user_id === userId);
  }
};
