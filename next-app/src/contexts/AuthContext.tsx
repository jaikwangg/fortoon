'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '@/lib/types';
import { toast } from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const router = useRouter();
  
  // Auto-login effect
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/login/byCookie', {
          method: 'POST',
          credentials: 'include', // Important for cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          setUser(data.data);
          setLoginSuccess(true);
          
          // Only redirect if we're on the login page
          if (window.location.pathname === '/login') {
            router.push('/');
          }
        } 
        // else {
        //   // If we're not authenticated and on a protected route, redirect to login
        //   if (window.location.pathname !== '/login') {
        //     router.push('/login');
        //   }
        //   setUser(null);
        //   setLoginSuccess(false);
        // }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setLoginSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setUser(data.data); // Update to match your API response structure
        setLoginSuccess(true);
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
        setLoginSuccess(false);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      setError('An error occurred during sign in');
      setLoginSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        setLoginSuccess(false);
        router.push('/');
        toast.success('Successfully logged out');
      } else {
        setError('Logout failed');
        toast.error('Failed to log out');
      }
    } catch (error) {
      console.error('Sign out failed:', error);
      setError('An error occurred during sign out');
      toast.error('An error occurred while logging out');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/login/byCookie', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      }
    } catch (error) {
      console.error('User refresh failed:', error);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    error,
    loginSuccess,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}