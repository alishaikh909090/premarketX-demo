import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useWallet } from '../hooks/useWallet';
import type { UserRole } from '../types';

interface AuthContextType {
  role: UserRole;
  isAdmin: boolean;
  isUser: boolean;
  toggleRole: () => void;
  setRole: (role: UserRole) => void;
  wallet: ReturnType<typeof useWallet>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_WALLETS = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'.toLowerCase(),
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('user');
  const wallet = useWallet();

  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  const toggleRole = useCallback(() => {
    setRoleState((prev) => (prev === 'admin' ? 'user' : 'admin'));
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
  }, []);

  useEffect(() => {
    if (wallet.address && ADMIN_WALLETS.includes(wallet.address.toLowerCase())) {
      setRoleState('admin');
    }
  }, [wallet.address]);

  return (
    <AuthContext.Provider value={{ role, isAdmin, isUser, toggleRole, setRole, wallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
