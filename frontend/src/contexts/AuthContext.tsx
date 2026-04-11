import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  workType: 'full-time' | 'part-time';
  preferredHours: string;
  platform: 'Zomato' | 'Swiggy' | 'Both';
  joinedDate: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; password: string; city: string; workType: string }) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapProfile(user: User, profile?: any): UserProfile {
  return {
    id: user.id,
    name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
    email: user.email || '',
    city: profile?.city || user.user_metadata?.city || '',
    workType: (profile?.work_type || 'full-time') as 'full-time' | 'part-time',
    preferredHours: profile?.preferred_hours || '10:00 AM - 10:00 PM',
    platform: (profile?.platform || 'Zomato') as 'Zomato' | 'Swiggy' | 'Both',
    joinedDate: user.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser: User) => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', authUser.id).single();
    setUser(mapProfile(authUser, data));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid potential deadlock with Supabase auth
        setTimeout(() => fetchProfile(session.user), 0);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const signup = useCallback(async (data: { name: string; email: string; password: string; city: string; workType: string }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, city: data.city },
      },
    });
    if (error) return { success: false, error: error.message };
    // Update profile with extra fields
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) {
      await supabase.from('profiles').update({
        name: data.name,
        city: data.city,
        work_type: data.workType,
      }).eq('user_id', sessionData.session.user.id);
    }
    return { success: true };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signup, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
