"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { mockUsers, type User, type UserRole } from '@/lib/mock-data';
import { getSupabaseClient } from '@/lib/supabase';

const AUTH_KEYS = {
  user: 'user',
  userRole: 'userRole',
  isLoggedIn: 'isLoggedIn',
} as const;

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEYS.user);
  localStorage.removeItem(AUTH_KEYS.userRole);
  localStorage.removeItem(AUTH_KEYS.isLoggedIn);
  sessionStorage.clear();
}

function persistAuth(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEYS.user, JSON.stringify(user));
  localStorage.setItem(AUTH_KEYS.userRole, user.role);
  localStorage.setItem(AUTH_KEYS.isLoggedIn, 'true');
}

function restoreAuthUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const isLoggedIn = localStorage.getItem(AUTH_KEYS.isLoggedIn);
    const storedUser = localStorage.getItem(AUTH_KEYS.user);
    if (isLoggedIn !== 'true' || !storedUser) return null;
    return JSON.parse(storedUser) as User;
  } catch {
    clearAuthStorage();
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restored = restoreAuthUser();
    if (restored) setUser(restored);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string, role: UserRole): Promise<boolean> => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 1. Check mock users (demo mode)
      const validCredentials: Record<string, { email: string; password: string; role: UserRole }> = {
        admin:   { email: 'admin@test.com',   password: 'password', role: 'admin' },
        bde:     { email: 'bde@test.com',     password: 'password', role: 'bde' },
        trainer: { email: 'trainer@test.com', password: 'password', role: 'trainer' },
        student: { email: 'student@test.com', password: 'password', role: 'student' },
      };

      const creds = validCredentials[role];
      if (creds && email === creds.email && password === creds.password) {
        const foundUser = mockUsers.find((u) => u.email === email && u.role === role);
        if (foundUser) {
          setUser(foundUser);
          persistAuth(foundUser);
          setLoading(false);
          return true;
        }
      }

      // 2. Check Supabase users (real signups)
      try {
        const supabaseClient = getSupabaseClient();
        const { data } = await supabaseClient
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .eq('role', role)
          .single();

        if (data) {
          const realUser: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            status: data.status || 'active',
            createdAt: data.created_at || new Date().toISOString(),
          };
          setUser(realUser);
          persistAuth(realUser);
          setLoading(false);
          return true;
        }
      } catch (err) {
        console.error('Supabase login error:', err);
      }

      setLoading(false);
      return false;
    },
    []
  );

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
