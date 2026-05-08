import { AppNote } from '../../types';
import { apiClient } from '../../lib/apiClient';

// Helper to convert backend format to AppNote format
const mapBackendNoteToAppNote = (backendNote: any): AppNote => {
  try {
     // If backend stores metadata in body_md as serialized json
     const parsedBody = JSON.parse(backendNote.body_md);
     return {
       note_id: backendNote.note_id,
       user_id: backendNote.created_by_user_id?.toString() || '',
       group_id: backendNote.scope_type === 'group' ? backendNote.scope_id : (parsedBody.group_id || ''),
       plan_id: parsedBody.plan_id || '',
       session_id: parsedBody.session_id || null,
       note_type: parsedBody.note_type || 'session',
       content: parsedBody.content || '',
       verse_id: parsedBody.verse_id || '',
       visibility: backendNote.scope_type === 'group' ? 'shared_group' : 'private',
       created_at: backendNote.created_at || new Date().toISOString()
     };
  } catch (e) {
     // Fallback if not JSON
     return {
       note_id: backendNote.note_id,
       user_id: backendNote.created_by_user_id?.toString() || '',
       group_id: backendNote.scope_id || '',
       plan_id: '',
       session_id: null,
       note_type: 'session',
       content: backendNote.body_md || '',
       verse_id: '',
       visibility: backendNote.scope_type === 'group' ? 'shared_group' : 'private',
       created_at: backendNote.created_at || new Date().toISOString()
     };
  }
};

export const notesApi = {
  getNotes: async (institutionId: string, groupId: string): Promise<AppNote[]> => {
    try {
      const [individualRes, groupRes] = await Promise.all([
        apiClient('/api/v2/notes/individual').catch(() => ({ data: [] })),
        apiClient(`/api/v2/institutions/${institutionId}/groups/${groupId}/notes`).catch(() => ({ data: [] }))
      ]);

      const individualNotes = Array.isArray(individualRes?.notes) ? individualRes.notes : Array.isArray(individualRes?.data) ? individualRes.data : Array.isArray(individualRes) ? individualRes : [];
      const groupNotes = Array.isArray(groupRes?.notes) ? groupRes.notes : Array.isArray(groupRes?.data) ? groupRes.data : Array.isArray(groupRes) ? groupRes : [];

      return [...individualNotes, ...groupNotes].map(mapBackendNoteToAppNote);
    } catch {
      return [];
    }
  },
  
  saveNote: async (institutionId: string, groupId: string, note: AppNote): Promise<AppNote> => {
    // Serialize metadata into body_md
    const bodyMdPayload = JSON.stringify({
      content: note.content,
      note_type: note.note_type,
      plan_id: note.plan_id,
      session_id: note.session_id,
      verse_id: note.verse_id,
      group_id: note.group_id
    });

    const isNew = !note.note_id || note.note_id.startsWith('note_');
    const endpoint = note.visibility === 'shared_group' 
      ? `/api/v2/institutions/${institutionId}/groups/${groupId}/notes`
      : `/api/v2/notes/individual`;

    if (isNew) {
      const response = await apiClient(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          title: `Note: ${note.note_type}`,
          body_md: bodyMdPayload
        })
      });
      return mapBackendNoteToAppNote(response.note || response.data || response);
    } else {
      const updateEndpoint = `/api/v2/notes/${note.note_id}`;
      const response = await apiClient(updateEndpoint, {
        method: 'PUT',
        body: JSON.stringify({
          title: `Note: ${note.note_type}`,
          body_md: bodyMdPayload
        })
      });
      return mapBackendNoteToAppNote(response.note || response.data || response);
    }
  },
  
  deleteNote: async (noteId: string): Promise<void> => {
    await apiClient(`/api/v2/notes/${noteId}`, { method: 'DELETE' });
  },
};
