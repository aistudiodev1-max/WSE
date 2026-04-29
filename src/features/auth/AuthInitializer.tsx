'use client';

import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { User } from '../../types';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setAppUser, setToken, setLoading } = useAuthStore();
  const { setActiveNav } = useUIStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token') || params.get('access_token');
      
      if (urlToken) {
        setToken(urlToken);
      }

      // Cleanup URL params
      if (urlToken) {
        params.delete('token');
        params.delete('access_token');
        
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState(null, '', newUrl);
      }
    }

    // Mock user for testing - In a real app this would be Firebase Listeners
    const timer = setTimeout(() => {
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
    }, 500);

    return () => clearTimeout(timer);
  }, [setUser, setAppUser, setLoading, setToken]);

  return <>{children}</>;
}
