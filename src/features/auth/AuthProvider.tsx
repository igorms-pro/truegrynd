'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthState = {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  lastEvent: string | null;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    initialized: false,
    lastEvent: null,
  });

  useEffect(() => {
    let isActive = true;
    const SAFETY_TIMEOUT_MS = 3000;
    const safetyId = window.setTimeout(() => {
      if (!isActive) return;
      setState((prev) => (prev.initialized ? prev : { ...prev, initialized: true }));
    }, SAFETY_TIMEOUT_MS);

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isActive) return;
        setState({
          user: data.session?.user ?? null,
          session: data.session ?? null,
          initialized: true,
          lastEvent: 'GET_SESSION',
        });
      } catch {
        if (!isActive) return;
        setState({ user: null, session: null, initialized: true, lastEvent: 'GET_SESSION_ERROR' });
      }
    };

    void init();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) return;
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        initialized: true,
        lastEvent: event,
      });
    });

    return () => {
      isActive = false;
      window.clearTimeout(safetyId);
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
