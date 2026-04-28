import { initialStudyPlans, initialAssignments } from '../../data';
import { StudyPlan, Assignment } from '../../types';

export const plansApi = {
  getPlans: async (): Promise<StudyPlan[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(initialStudyPlans), 500);
    });
  },
  getAssignments: async (): Promise<Assignment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(initialAssignments), 500);
    });
  },
};
