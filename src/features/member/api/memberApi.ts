import { apiClient } from '../../../lib/apiClient';

export interface UserProfile {
  user_id: string;
  user_name: string;
  email: string;
  institution_id: string;
  institution_name: string;
  role: string;
}

export interface MemberSession {
  session_id: string;
  plan_id: string;
  title: string;
  order_index: number;
  primary_verse: string;
  teaching_text?: string;
  reflection_prompt?: string;
  supporting_verses?: string[];
  is_completed?: boolean;
}

export interface PlanProgressPayload {
  status: 'active' | 'inactive' | 'in_progress' | 'completed';
  progress_percent: number;
}

export interface SessionProgressPayload {
  is_completed: boolean;
}

export interface MemberProgressOverview {
  plan_id: string;
  status: string;
  progress_percent: number;
  sessions_completed: number;
  total_sessions: number;
}

export const memberApi = {
  /**
   * Get current user profile (v1)
   */
  getProfile: async (): Promise<UserProfile> => {
    return apiClient('/api/v1/profile');
  },

  /**
   * List sessions for a group plan (v2)
   */
  getGroupPlanSessions: async (
    institution: string,
    group: string,
    planId: string
  ): Promise<MemberSession[]> => {
    return apiClient(`/api/v2/institutions/${institution}/groups/${group}/plans/${planId}/sessions`);
  },

  /**
   * Get session details (v2)
   * Note: This automatically starts tracking if not already started.
   */
  getSessionDetails: async (
    institution: string,
    group: string,
    planId: string,
    sessionId: string
  ): Promise<MemberSession> => {
    return apiClient(`/api/v2/institutions/${institution}/groups/${group}/plans/${planId}/sessions/${sessionId}`);
  },

  /**
   * Update overall plan progress (v2)
   */
  updatePlanProgress: async (
    institution: string,
    group: string,
    planId: string,
    payload: PlanProgressPayload
  ): Promise<void> => {
    return apiClient(`/api/v2/institutions/${institution}/groups/${group}/plans/${planId}/progress`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update specific session completion status (v2)
   */
  updateSessionProgress: async (
    institution: string,
    group: string,
    planId: string,
    sessionId: string,
    payload: SessionProgressPayload
  ): Promise<void> => {
    return apiClient(`/api/v2/institutions/${institution}/groups/${group}/plans/${planId}/sessions/${sessionId}/progress`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get member progress overview for a plan (v2)
   */
  getPlanProgress: async (
    institution: string,
    group: string,
    planId: string
  ): Promise<MemberProgressOverview> => {
    return apiClient(`/api/v2/institutions/${institution}/groups/${group}/plans/${planId}/progress`);
  },
};
