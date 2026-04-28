'use client';

import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { User } from '../../types';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setAppUser, setLoading } = useAuthStore();

  useEffect(() => {
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
  }, [setUser, setAppUser, setLoading]);

  return <>{children}</>;
}
