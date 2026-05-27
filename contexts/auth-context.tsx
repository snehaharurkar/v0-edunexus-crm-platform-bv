"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { mockUsers, type User, type UserRole } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - check if credentials match
    const validCredentials: Record<string, { email: string; password: string; role: UserRole }> = {
      admin: { email: 'admin@test.com', password: 'password', role: 'admin' },
      bde: { email: 'bde@test.com', password: 'password', role: 'bde' },
      trainer: { email: 'trainer@test.com', password: 'password', role: 'trainer' },
      executive: { email: 'executive@test.com', password: 'password', role: 'executive' },
      student: { email: 'student@test.com', password: 'password', role: 'student' },
    };

    const creds = validCredentials[role];
    
    if (creds && email === creds.email && password === creds.password) {
      const foundUser = mockUsers.find(u => u.email === email && u.role === role);
      if (foundUser) {
        setUser(foundUser);
        setLoading(false);
        return true;
      }
    }
    
    setLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
