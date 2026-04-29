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
  saveProgress: async (progress: Progress, institutionId = 'default'): Promise<Progress> => {
    try {
      // API expects: is_completed: true for a session or status / progress_percent for plan
      const planId = 'default'; // In a real app we derive this
      const payload = {
        is_completed: progress.status === 'completed'
      };
      
      await apiClient(`/api/v2/institutions/${institutionId}/groups/${progress.group_id}/plans/${planId}/sessions/${progress.session_id}/progress`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      localProgress = [...localProgress, progress];
      return progress;
    } catch {
      localProgress = [...localProgress, progress];
      return progress;
    }
  },
};
