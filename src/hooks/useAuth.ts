import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  return {
    isLoggedIn,
    loading,
    login,
    logout
  };
}
