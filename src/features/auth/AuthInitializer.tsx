'use client';

import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { User } from '../../types';
import { memberApi } from '../member/api/memberApi';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setAppUser, setToken, setLoading } = useAuthStore();
  const { setActiveNav } = useUIStore();

  useEffect(() => {
    const initAuth = async () => {
      let currentToken = useAuthStore.getState().token;

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token') || params.get('access_token');
        
        if (urlToken) {
          currentToken = urlToken;
          setToken(urlToken);
          // Cleanup URL params
          params.delete('token');
          params.delete('access_token');
          const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
          window.history.replaceState(null, '', newUrl);
        }
      }

      if (currentToken) {
        try {
          const profile = await memberApi.getProfile();
          setUser({ uid: profile.user_id, displayName: profile.user_name });
          setAppUser({
            user_id: profile.user_id,
            user_name: profile.user_name,
            role: profile.role,
            licensed: true,
            membership_level: 'Standard',
            church_id: profile.institution_id,
            church_name: profile.institution_name
          });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          // Fallback to mock for testing if explicitly desired, but here we should probably clear auth
          // setUser(null); setAppUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        // Mock user for testing if no token (legacy behavior for demo)
        const mockUser = {
          uid: 'user_01',
          displayName: 'Demo User'
        };
        const mockAppUser: User = {
          user_id: 'user_01',
          user_name: 'Demo User',
          role: 'admin',
          licensed: true,
          membership_level: 'Bible Study Plus',
          church_id: 'church_01',
          church_name: 'Immanuel Church'
        };
        setUser(mockUser);
        setAppUser(mockAppUser);
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setAppUser, setLoading, setToken]);

  return <>{children}</>;
}
