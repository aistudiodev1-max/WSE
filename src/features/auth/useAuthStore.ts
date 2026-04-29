import { create } from 'zustand';
import { User } from '../../types';

interface AuthState {
  user: { uid: string; displayName: string } | null;
  appUser: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: { uid: string; displayName: string } | null) => void;
  setAppUser: (appUser: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  appUser: null,
  token: null,
  loading: true,
  setUser: (user) => set({ user }),
  setAppUser: (appUser) => set({ appUser }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),
}));
