import { createContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface UserInfo {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  company_id: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userData: UserInfo | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).then(() => {
      if (user) {
        fetchUserData(user.id);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData(user.id);
    }
  }, [user]);

  const checkUserDataForConsistency = () => {
    if (localStorage.getItem('userData')) {
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (storedUserData.id !== user?.id) {
        localStorage.removeItem('userData');
        setUserData(null);
        return false;
      }
      if (!storedUserData.id || !storedUserData.email || !storedUserData.first_name || !storedUserData.last_name || !storedUserData.role || !storedUserData.company_id) {
        localStorage.removeItem('userData');
        setUserData(null);
        return false;
      }
    }
    return true;
  };

  const fetchUserData = async (userId: string) => {
    if (localStorage.getItem('userData')) {
      if (!checkUserDataForConsistency()) {
        return;
      }
      setUserData(JSON.parse(localStorage.getItem('userData') || '{}'));
      return;
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserData(data);

      localStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
      localStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
} 