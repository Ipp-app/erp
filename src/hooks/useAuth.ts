import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { getUserRoles } from '../lib/roles';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    async function getSessionAndUser() {
      setLoading(true);
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error fetching user:", error);
        setIsLoggedIn(false);
        setUser(null);
        setUserRoles([]);
      } else {
        setIsLoggedIn(!!supabaseUser);
        setUser(supabaseUser);
        if (supabaseUser) {
          const roles = await getUserRoles(supabaseUser.id);
          setUserRoles(roles);
        } else {
          setUserRoles([]);
        }
      }
      setLoading(false);
    }

    getSessionAndUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setUser(session?.user || null);
      if (session?.user) {
        getUserRoles(session.user.id).then(roles => setUserRoles(roles));
      } else {
        setUserRoles([]);
      }
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
    setUser(null);
    setUserRoles([]);
  };

  return {
    isLoggedIn,
    loading,
    user,
    userRoles,
    login,
    logout
  };
}