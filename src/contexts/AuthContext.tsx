import React, { createContext, useContext, useState, useCallback } from 'react';
import { mockUser, type UserProfile } from '@/lib/mockData';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (profile: Partial<UserProfile>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('rideShield_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (_email: string, _password: string) => {
    // Mock login - always succeeds
    setUser(mockUser);
    localStorage.setItem('rideShield_user', JSON.stringify(mockUser));
    return true;
  }, []);

  const signup = useCallback(async (profile: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      ...mockUser,
      ...profile,
      id: 'usr_' + Math.random().toString(36).slice(2, 8),
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    localStorage.setItem('rideShield_user', JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('rideShield_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
