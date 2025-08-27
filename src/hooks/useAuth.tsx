import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { authRateLimiter, logSecurityEvent } from '@/lib/security';
import { useSecurityMonitoring } from './useSecurityMonitoring';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { logAuthFailure, logAuthSuccess, logSuspiciousActivity } = useSecurityMonitoring();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Check rate limiting
    const clientId = `${email}:${navigator.userAgent}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      const remainingTime = authRateLimiter.getRemainingTime(clientId);
      const minutes = Math.ceil(remainingTime / (60 * 1000));
      
      logSecurityEvent('rate_limit_exceeded', { email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), remainingTime });
      toast.error(`Too many login attempts. Please try again in ${minutes} minutes.`);
      return { error: new Error('Rate limit exceeded') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      logAuthFailure(error.message, email);
      toast.error(error.message);
    } else {
      logAuthSuccess('login', email);
      // Reset rate limiter on successful login
      authRateLimiter.reset(clientId);
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    // Check rate limiting for registration
    const clientId = `signup:${email}:${navigator.userAgent}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      const remainingTime = authRateLimiter.getRemainingTime(clientId);
      const minutes = Math.ceil(remainingTime / (60 * 1000));
      
      logSecurityEvent('rate_limit_exceeded', { email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), action: 'signup' });
      toast.error(`Too many registration attempts. Please try again in ${minutes} minutes.`);
      return { error: new Error('Rate limit exceeded') };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });
    
    if (error) {
      logAuthFailure(error.message, email);
      toast.error(error.message);
    } else {
      logAuthSuccess('register', email);
      toast.success('Check your email to confirm your account!');
    }
    
    return { error };
  };

  const signOut = async () => {
    try {
      logSecurityEvent('auth_logout', { timestamp: Date.now() });
      
      const { error } = await supabase.auth.signOut();
      if (error && error.message !== 'Session not found') {
        toast.error(error.message);
      }
      
      // Clear session tracking
      sessionStorage.removeItem('session_start');
      
      // Always clear local state regardless of session status
      setSession(null);
      setUser(null);
    } catch (error) {
      // If there's any error, still clear the local state
      setSession(null);
      setUser(null);
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
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

export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useSession() {
  const { session } = useAuth();
  return session;
}