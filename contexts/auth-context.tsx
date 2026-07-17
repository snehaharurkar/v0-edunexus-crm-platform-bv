"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);

  // This application is currently a demo, so persist only the selected mock
  // user. A production app must replace this with a server-issued session.
  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem('edunexus-demo-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        if (mockUsers.some((mockUser) => mockUser.id === parsedUser.id && mockUser.role === parsedUser.role)) {
          setUser(parsedUser);
        } else {
          window.localStorage.removeItem('edunexus-demo-user');
        }
      }
    } catch {
      window.localStorage.removeItem('edunexus-demo-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - check if credentials match
    const validCredentials: Record<string, { email: string; password: string; role: UserRole }> = {
      admin: { email: 'admin@test.com', password: 'password', role: 'admin' },
      bde: { email: 'bde@test.com', password: 'password', role: 'bde' },
      trainer: { email: 'trainer@test.com', password: 'password', role: 'trainer' },
      student: { email: 'student@test.com', password: 'password', role: 'student' },
    };

    const creds = validCredentials[role];
    
    if (creds && email === creds.email && password === creds.password) {
      const foundUser = mockUsers.find(u => u.email === email && u.role === role);
      if (foundUser) {
        setUser(foundUser);
        window.localStorage.setItem('edunexus-demo-user', JSON.stringify(foundUser));
        setLoading(false);
        return true;
      }
    }
    
    setLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem('edunexus-demo-user');
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
