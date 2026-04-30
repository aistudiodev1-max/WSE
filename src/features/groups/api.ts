import { apiClient } from '../../lib/apiClient';
import { initialGroups } from '../../data';
import { Group } from '../../types';

export const groupsApi = {
  getGroups: async (institutionId: string): Promise<Group[]> => {
    try {
      const data = await apiClient(`/api/v2/institutions/${institutionId}/groups`);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((g: any) => ({
          group_id: String(g.id || g.group_id),
          group_name: g.name || g.group_name || 'Unnamed Group',
          church_id: institutionId,
          church_name: g.institution_name || 'Institution',
          group_override: 'none',
          members: g.members ? g.members.map((m: any) => String(m.id || m)) : [],
          role_overrides: {}
        }));
      }
      return initialGroups;
    } catch {
      return initialGroups;
    }
  },
  
  getGroup: async (institutionId: string, groupId: string): Promise<Group | null> => {
     try {
       const data = await apiClient(`/api/v2/institutions/${institutionId}/groups/${groupId}`);
       if (data) {
         return {
            group_id: String(data.id || data.group_id),
            group_name: data.name || data.group_name || 'Unnamed Group',
            church_id: institutionId,
            church_name: data.institution_name || 'Institution',
            group_override: 'none',
            members: data.members ? data.members.map((m: any) => String(m.id || m)) : [],
            role_overrides: {}
         };
       }
       return null;
     } catch {
       return null;
     }
  }
};
