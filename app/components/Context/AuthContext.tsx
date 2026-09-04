"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../Lib/supabaseClient";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { logUserActivity } from '@/lib/analytics';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signin: (
    email: string,
    password: string
  ) => Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }>;
  signup: (
    email: string,
    password: string,
    userData?: {
      firstName?: string;
      lastName?: string;
      country?: string;
      city?: string;
      phone?: string;
    }
  ) => Promise<{ user: User | null; session: Session | null }>;
  signout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Session backup key
const SESSION_BACKUP_KEY = 'portx_session_backup';
const BACKUP_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const sessionRefreshTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Backup session to localStorage
  const backupSession = (session: Session | null) => {
    if (typeof window === 'undefined') return;
    
    if (session) {
      try {
        localStorage.setItem(SESSION_BACKUP_KEY, JSON.stringify({
          user: session.user,
          expires_at: session.expires_at,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Failed to backup session:', e);
      }
    }
  };

  // Restore session from backup
  const restoreSessionFromBackup = (): Partial<Session> | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const backup = localStorage.getItem(SESSION_BACKUP_KEY);
      if (!backup) return null;
      
      const data = JSON.parse(backup);
      const age = Date.now() - data.timestamp;
      
      // Only use backup if less than TTL
      if (age < BACKUP_TTL_MS && data.user) {
        console.log('🔄 Restored session from backup');
        return {
          user: data.user,
          expires_at: data.expires_at,
        };
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    }
    
    return null;
  };

  // Clear session backup
  const clearSessionBackup = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_BACKUP_KEY);
    }
  };

  // Set up session refresh
  const setupSessionRefresh = (session: Session | null) => {
    if (sessionRefreshTimer.current) {
      clearTimeout(sessionRefreshTimer.current);
      sessionRefreshTimer.current = undefined;
    }
    
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const refreshTime = expiresAt.getTime() - Date.now() - 60000; // Refresh 1 minute before expiry
      
      if (refreshTime > 0) {
        sessionRefreshTimer.current = setTimeout(async () => {
          console.log('🔄 Refreshing session...');
          const { data: { session: newSession } } = await supabase.auth.refreshSession();
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            backupSession(newSession);
            setupSessionRefresh(newSession);
          }
        }, refreshTime);
      }
    }
  };

  // Load session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          console.log('✅ Session loaded from Supabase');
          setSession(currentSession);
          setUser(currentSession.user);
          backupSession(currentSession);
          setupSessionRefresh(currentSession);
        } else {
            // Try to restore from backup, but verify the user still exists
            const backupSessionData = restoreSessionFromBackup();
            if (backupSessionData?.user) {
              const { data: { user: validUser }, error: userError } =
                await supabase.auth.getUser();

              if (userError || !validUser) {
                // User no longer exists or is invalid
                console.warn('⚠️ Backup session user no longer valid. Clearing backup.');
                clearSessionBackup();
                setSession(null);
                setUser(null);
              } else {
                console.log('⚠️ Using backup session while reconnecting...');
                setSession(backupSessionData as Session);
                setUser(validUser);
                
                // Try to refresh in background
                const { data: { session: newSession } } = await supabase.auth.refreshSession();
                if (newSession) {
                  console.log('✅ Session restored after refresh');
                  setSession(newSession);
                  setUser(newSession.user);
                  backupSession(newSession);
                  setupSessionRefresh(newSession);
                }
              }
            }
          }
      } catch (error) {
        console.error('Session init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('🔐 AUTH EVENT:', event, 'Has session:', !!newSession);
      
      switch (event) {
        case 'SIGNED_OUT':
          clearSessionBackup();
          if (sessionRefreshTimer.current) {
            clearTimeout(sessionRefreshTimer.current);
          }
          setUser(null);
          setSession(null);
          break;
          
        case 'TOKEN_REFRESHED':
          console.log('✅ Token refreshed successfully');
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession) {
            backupSession(newSession);
            setupSessionRefresh(newSession);
          }
          break;
          
        case 'SIGNED_IN':
        case 'USER_UPDATED':
        default:
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession) {
            backupSession(newSession);
            setupSessionRefresh(newSession);
          }
          break;
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (sessionRefreshTimer.current) {
        clearTimeout(sessionRefreshTimer.current);
      }
    };
  }, []);

  const signin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.session) {
      setSession(data.session);
      setUser(data.user);
      backupSession(data.session);
      setupSessionRefresh(data.session);
      
      // Log user activity (async, don't await)
      if (data.session?.user?.id) {
        logUserActivity(data.session.user.id, 'not connected', 'login').catch(console.error);
      }
    }

    return { data, error };
  };

  const signup = async (
    email: string,
    password: string,
    userData?: {
      firstName?: string;
      lastName?: string;
      country?: string;
      city?: string;
      phone?: string;
    }
  ) => {
    const { firstName = "", lastName = "", country = "", city = "", phone = "" } =
      userData || {};

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            country,
            city,
            phone,
          },
          emailRedirectTo: `${window.location.origin}/signin`,
        },
      });

      if (error) {
      console.error("🚨 Raw Supabase signup error:", error);
      throw new Error(error.message);  // now you'll see the real message
      }

      setSession(data.session ?? null);
      setUser(data.user ?? null);
      if (data.session) {
        backupSession(data.session);
        setupSessionRefresh(data.session);
      }

      return { user: data.user, session: data.session };
    } catch (err) {
      console.error("Signup error in AuthContext:", err);
      throw err;
    }
  };

  const signout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setUser(null);
    setSession(null);
    clearSessionBackup();
    
    if (sessionRefreshTimer.current) {
      clearTimeout(sessionRefreshTimer.current);
      sessionRefreshTimer.current = undefined;
    }
    
    router.push("/signin");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    router.push("/signin");
  };

  const value = {
    user,
    session,
    loading,
    signin,
    signup,
    signout,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    isLoggedIn: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
