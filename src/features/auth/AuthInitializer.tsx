'use client';

import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { memberApi } from '../member/api/memberApi';
import { apiClient } from '../../lib/apiClient';
import { auth as firebaseAuth } from '../../lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

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
          sessionStorage.setItem('wse_auth_token', urlToken);
          // Cleanup URL params
          params.delete('token');
          params.delete('access_token');
          const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
          window.history.replaceState(null, '', newUrl);
        } else if (!currentToken) {
          const storedToken = sessionStorage.getItem('wse_auth_token');
          if (storedToken) {
             currentToken = storedToken;
             setToken(storedToken);
          }
        }
      }

      if (currentToken) {
        try {
          // 1. Fetch Profile
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

          // 2. Sync with Firebase using custom token
          try {
            const fbCustomTokenRes = await apiClient('/api/v2/firebase/custom-token', { method: 'POST' });
            if (fbCustomTokenRes && fbCustomTokenRes.token) {
              await signInWithCustomToken(firebaseAuth, fbCustomTokenRes.token);
              console.log('Firebase auth successful using custom token.');
            } else {
               console.warn('Did not receive a token from /api/v2/firebase/custom-token');
            }
          } catch (fbError) {
            console.error('Failed to obtain or sign in with Firebase custom token:', fbError);
          }

        } catch (error) {
          console.error('Failed to fetch profile:', error);
          setUser(null);
          setAppUser(null);
          setToken(null);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('wse_auth_token');
          }
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
