import { create } from 'zustand';
import { User } from '../../types';

interface AuthState {
  user: { uid: string; displayName: string } | null;
  appUser: User | null;
  loading: boolean;
  setUser: (user: { uid: string; displayName: string } | null) => void;
  setAppUser: (appUser: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  appUser: null,
  loading: true,
  setUser: (user) => set({ user }),
  setAppUser: (appUser) => set({ appUser }),
  setLoading: (loading) => set({ loading }),
}));
