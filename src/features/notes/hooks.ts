import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from './api';
import { AppNote } from '../../types';

export const useNotes = (institutionId: string | undefined, groupId: string | undefined) => {
  return useQuery<AppNote[], Error>({
    queryKey: ['notes', institutionId, groupId],
    queryFn: () => notesApi.getNotes(institutionId!, groupId!),
    enabled: !!institutionId && !!groupId,
  });
};

export const useSaveNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { institutionId: string, groupId: string, note: AppNote }) => notesApi.saveNote(data.institutionId, data.groupId, data.note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.institutionId, variables.groupId] });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { institutionId: string, groupId: string, noteId: string }) => notesApi.deleteNote(data.noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.institutionId, variables.groupId] });
    },
  });
};
