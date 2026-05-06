import { AppNote } from '../../types';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrorHandler';
import { useAuthStore } from '../auth/useAuthStore';

export const notesApi = {
  getNotes: async (): Promise<AppNote[]> => {
    const appUser = useAuthStore.getState().appUser;
    if (!auth.currentUser || !appUser) return [];
    try {
      const institutionId = appUser.church_id || 'default';
      const notesRef = collection(db, `institutions/${institutionId}/notes`);

      const qPrivate = query(
        notesRef,
        where('userId', '==', appUser.user_id)
      );
      const snapshotPrivate = await getDocs(qPrivate);
      
      const qShared = query(
        notesRef,
        where('visibility', '==', 'shared_group')
      );
      const snapshotShared = await getDocs(qShared);

      const allNotes = new Map<string, AppNote>();
      
      const processDoc = (docSnap: any) => {
         const data = docSnap.data();
         allNotes.set(docSnap.id, {
           note_id: docSnap.id,
           user_id: data.userId,
           group_id: data.groupId,
           plan_id: data.planId,
           session_id: data.sessionId || null,
           note_type: data.noteType,
           content: data.content,
           verse_id: data.verseId || '',
           visibility: data.visibility || 'private',
           created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
         });
      };

      snapshotPrivate.forEach(processDoc);
      snapshotShared.forEach(processDoc);

      return Array.from(allNotes.values());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'notes');
      return [];
    }
  },

  saveNote: async (note: AppNote): Promise<AppNote> => {
    const appUser = useAuthStore.getState().appUser;
    if (!auth.currentUser || !appUser) throw new Error("Must be logged in to save note");
    
    const institutionId = appUser.church_id || 'default';
    const notesRef = collection(db, `institutions/${institutionId}/notes`);

    const isNew = !note.note_id || note.note_id.startsWith('new_');
    const noteRef = !isNew ? doc(db, `institutions/${institutionId}/notes`, note.note_id) : doc(notesRef);
    
    try {
      if (isNew) {
        const payload: any = {
          institutionId: institutionId,
          userId: appUser.user_id,
          groupId: note.group_id,
          planId: note.plan_id,
          noteType: note.note_type,
          content: note.content,
          visibility: note.visibility,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        if (note.session_id) payload.sessionId = note.session_id;
        if (note.verse_id) payload.verseId = note.verse_id;
        
        await setDoc(noteRef, payload);
      } else {
        const updatePayload = {
          content: note.content,
          visibility: note.visibility,
          updatedAt: serverTimestamp(),
        };
        await updateDoc(noteRef, updatePayload);
      }

      return {
        ...note,
        note_id: noteRef.id,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notes/${noteRef.id}`);
      return note;
    }
  },

  deleteNote: async (noteId: string): Promise<void> => {
    const appUser = useAuthStore.getState().appUser;
    if (!auth.currentUser || !appUser) throw new Error("Must be logged in");
    
    const institutionId = appUser.church_id || 'default';
    try {
      await deleteDoc(doc(db, `institutions/${institutionId}/notes`, noteId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${noteId}`);
    }
  },
};
