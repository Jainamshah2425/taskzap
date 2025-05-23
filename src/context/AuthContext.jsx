import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import React from 'react';
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Check if supabase client is properly initialized
    if (!supabase) {
      console.error('Supabase client is not initialized');
      setError('Supabase client is not initialized');
      setLoading(false);
      return;
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (isMounted) {
          setUser(session?.user ?? null);
          setError(null);
        }
      } catch (err) {
        console.error('Error getting session:', err);
        if (isMounted) {
          setError(err.message || 'Failed to get session');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const authListener = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'no user');
        
        if (isMounted) {
          setUser(session?.user ?? null);
          setError(null);
          
          // Only set loading to false if we're not in the initial loading state
          if (!loading) {
            setLoading(false);
          }
        }
      }
    );

    // Cleanup function
    return () => {
      isMounted = false;
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, [loading]);

  const signIn = async (email, password) => {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      setError(error.message);
      return { data: null, error };
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error signing in:', err);
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      setError(error.message);
      return { data: null, error };
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error signing up:', err);
      const errorMessage = err.message || 'Failed to sign up';
      setError(errorMessage);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      // Explicitly set user to null on successful sign out
      setUser(null);
      return { error: null };
    } catch (err) {
      console.error('Error signing out:', err);
      const errorMessage = err.message || 'Failed to sign out';
      setError(errorMessage);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Create the context value object
  const contextValue = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};