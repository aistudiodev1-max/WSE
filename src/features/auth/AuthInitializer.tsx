'use client';

import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { User } from '../../types';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setAppUser, setToken, setLoading } = useAuthStore();
  const { setIsEmbed, setActiveNav } = useUIStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token') || params.get('access_token');
      
      // Check for embed flags
      const embedKeys = ['embed', 'isEmbed', 'embedded'];
      let foundEmbed = false;
      const isEmbedFromUrl = embedKeys.some(key => {
        const val = params.get(key);
        if (val === '1' || val === 'true') {
          foundEmbed = true;
          return true;
        }
        return false;
      });

      if (isEmbedFromUrl) {
        setIsEmbed(true);
        setActiveNav('Wisdom Study Engine');
      }

      if (urlToken) {
        setToken(urlToken);
      }

      // Cleanup URL params
      if (urlToken || foundEmbed) {
        params.delete('token');
        params.delete('access_token');
        // Optionally keep embed flags if we want persistence on refresh without localstorage
        // but the user asked to handle changes, and usually we clean tokens.
        // For now, let's just clean tokens as explicitly requested for security.
        
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
  }, [setUser, setAppUser, setLoading, setToken, setIsEmbed]);

  return <>{children}</>;
}
