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
            church_name: profile.institution_name,
            group_id: profile.group_id
          });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          setUser(null);
          setAppUser(null);
          setToken(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setAppUser(null);
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setAppUser, setLoading, setToken]);

  return <>{children}</>;
}
