'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { CompleteProfile } from '@/lib/types/database.types';

const AppProfileContext = createContext<CompleteProfile | null>(null);

type ProviderProps = {
  profile: CompleteProfile;
  children: ReactNode;
};

export function AppProfileProvider({ profile, children }: ProviderProps) {
  return <AppProfileContext.Provider value={profile}>{children}</AppProfileContext.Provider>;
}

export function useOptionalAppProfile(): CompleteProfile | null {
  return useContext(AppProfileContext);
}
