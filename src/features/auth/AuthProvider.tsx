'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthState = {
  user: User | null;
  session: Session | null;
  initialized: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    initialized: false,
  });

  useEffect(() => {
    let isActive = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isActive) return;
        setState({
          user: data.session?.user ?? null,
          session: data.session ?? null,
          initialized: true,
        });
      })
      .catch(() => {
        if (!isActive) return;
        setState({ user: null, session: null, initialized: true });
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) return;
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        initialized: true,
      });
    });

    return () => {
      isActive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => state, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
