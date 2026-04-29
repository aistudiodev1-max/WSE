import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from './api';
import { AppNote } from '../../types';

export const useNotes = () => {
  return useQuery<AppNote[], Error>({
    queryKey: ['notes'],
    queryFn: () => notesApi.getNotes(),
  });
};

export const useSaveNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesApi.saveNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesApi.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};
