import { apiClient } from '../../lib/apiClient';
import { initialProgress } from '../../data';
import { Progress } from '../../types';

let localProgress = [...initialProgress];

export const progressApi = {
  getProgress: async (institutionId = 'default', groupId = 'default', planId = 'default'): Promise<Progress[]> => {
    try {
      const data = await apiClient(`/api/v2/institutions/${institutionId}/groups/${groupId}/plans/${planId}/progress`);
      // V2 returns an overview or list. If it matches Progress type we return it.
      if (data && Array.isArray(data)) return data;
      return localProgress;
    } catch {
      return localProgress;
    }
  },
  saveProgress: async (progress: Progress, institutionId = 'default', planId = 'default', sessionsCount = 1, completedCount = 0): Promise<Progress> => {
    try {
      // First, update the session progress
      const sessionPayload = {
        is_completed: progress.status === 'completed'
      };
      
      await apiClient(`/api/v2/institutions/${institutionId}/groups/${progress.group_id}/plans/${planId}/sessions/${progress.session_id}/progress`, {
        method: 'POST',
        body: JSON.stringify(sessionPayload)
      });

      // Recalculate percent after marking this session complete
      const newCompletedCount = progress.status === 'completed' ? completedCount + 1 : completedCount;
      const progressPercent = sessionsCount > 0 ? Math.round((newCompletedCount / sessionsCount) * 100) : 0;
      
      // Update plan progress
      const planPayload = {
        status: progressPercent === 100 ? 'completed' : 'in_progress',
        progress_percent: progressPercent
      };

      await apiClient(`/api/v2/institutions/${institutionId}/groups/${progress.group_id}/plans/${planId}/progress`, {
        method: 'POST',
        body: JSON.stringify(planPayload)
      });

      localProgress = [...localProgress, progress];
      return progress;
    } catch {
      localProgress = [...localProgress, progress];
      return progress;
    }
  },
};
