import { apiClient } from '../../../lib/apiClient';

export interface UserProfileResponse {
  user: {
    id: number;
    institution_id: number;
    first_name: string;
    last_name: string;
    email: string;
    roles: Array<{ name: string }>;
    institution: {
      id: number;
      name: string;
    };
    institution_groups?: Array<{
      id: number;
      name: string;
    }>;
  };
}

export interface UserProfile {
  user_id: string;
  user_name: string;
  email: string;
  institution_id: string;
  institution_name: string;
  group_id?: string;
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
    const data: UserProfileResponse = await apiClient('/api/v1/profile');
    const { user } = data;
    
    return {
      user_id: String(user.id),
      user_name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      institution_id: String(user.institution_id || user.institution?.id),
      institution_name: user.institution?.name || 'Institution',
      group_id: user.institution_groups && user.institution_groups.length > 0 ? String(user.institution_groups[0].id) : undefined,
      role: user.roles?.[0]?.name || 'Member',
    };
  },

  /**
   * View the group (v2)
   */
  getGroup: async (
    institution: string,
    group: string
  ): Promise<any> => {
    return apiClient(`/api/v2/institutions/${institution}/groups/${group}`);
  },

  /**
   * List plans assigned to the group (v2)
   */
  getGroupPlans: async (
    institution: string,
    group: string
  ): Promise<any[]> => {
    return apiClient(`/api/v2/institutions/${institution}/groups/${group}/plans`);
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
