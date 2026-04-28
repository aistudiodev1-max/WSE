'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: { uid: string; displayName: string } | null;
  appUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; displayName: string } | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user for testing without Firebase
    setTimeout(() => {
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
  }, []);

  return (
    <AuthContext.Provider value={{ user, appUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
