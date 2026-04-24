import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../hooks/useWallet';
import type { UserRole } from '../types';

interface AuthContextType {
  role: UserRole;
  isAdmin: boolean;
  isUser: boolean;
  toggleRole: () => void;
  setRole: (role: UserRole) => void;
  wallet: ReturnType<typeof useWallet>;
  userEmail: string | null;
  isEmailAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('user');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isEmailAdmin, setIsEmailAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const wallet = useWallet();

  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  // Check Supabase auth session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        checkAdminEmail(session.user.email);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        checkAdminEmail(session.user.email);
      } else {
        setUserEmail(null);
        setIsEmailAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminEmail = async (email: string) => {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', email)
        .maybeSingle();
      if (data) {
        setIsEmailAdmin(true);
        setRoleState('admin');
      } else {
        setIsEmailAdmin(false);
      }
    } catch {
      setIsEmailAdmin(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setIsEmailAdmin(false);
    setRoleState('user');
  };

  const toggleRole = useCallback(() => {
    setRoleState((prev) => (prev === 'admin' ? 'user' : 'admin'));
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
  }, []);

  return (
    <AuthContext.Provider value={{
      role, isAdmin, isUser, toggleRole, setRole, wallet,
      userEmail, isEmailAdmin, signInWithEmail, signUpWithEmail, signOut, authLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
