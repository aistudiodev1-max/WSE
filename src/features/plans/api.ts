import { apiClient } from '../../lib/apiClient';
import { initialStudyPlans, initialAssignments } from '../../data';
import { StudyPlan, Assignment } from '../../types';

export const plansApi = {
  getPlans: async (institutionId?: string): Promise<StudyPlan[]> => {
    try {
      // In a real flow, you would fetch plans for the institution
      // return await apiClient(`/institutions/${institutionId}/plans`);
      return initialStudyPlans;
    } catch {
      return initialStudyPlans;
    }
  },
  getAssignments: async (): Promise<Assignment[]> => {
    // There is no explicit assignments endpoint listed, we might fetch group assigned plans
    // return await apiClient(`/institutions/${institutionId}/groups/${groupId}/plans`);
    return initialAssignments;
  },
};
