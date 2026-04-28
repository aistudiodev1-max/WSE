import { initialNotes } from '../../data';
import { AppNote } from '../../types';

let localNotes = [...initialNotes];

export const notesApi = {
  getNotes: async (): Promise<AppNote[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(localNotes), 500);
    });
  },
  saveNote: async (note: AppNote): Promise<AppNote> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localNotes = [...localNotes, note];
        resolve(note);
      }, 500);
    });
  },
  deleteNote: async (noteId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localNotes = localNotes.filter(n => n.note_id !== noteId);
        resolve();
      }, 500);
    });
  },
};
