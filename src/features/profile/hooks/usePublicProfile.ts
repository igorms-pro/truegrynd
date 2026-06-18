'use client';

import { useMemo } from 'react';

import { getProfileByUsername } from '@/features/profile/services/profile';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { Profile } from '@/lib/types/database.types';

type State =
  | { status: 'loading'; profile: null; error: null }
  | { status: 'ready'; profile: Profile; error: null }
  | { status: 'error'; profile: null; error: string };

const invalidUsernameState: State = {
  status: 'error',
  profile: null,
  error: 'profile_not_found',
};

export function usePublicProfile(username: string): { state: State; refetch: () => void } {
  const trimmed = username.trim();
  const { state: resource, refetch } = useAsyncResource<Profile>(
    () => getProfileByUsername(trimmed),
    [trimmed],
    { enabled: trimmed !== '' },
  );

  const state = useMemo<State>(() => {
    if (!trimmed) return invalidUsernameState;
    if (resource.status === 'ready')
      return { status: 'ready', profile: resource.data, error: null };
    if (resource.status === 'error')
      return { status: 'error', profile: null, error: resource.message };
    return { status: 'loading', profile: null, error: null };
  }, [trimmed, resource]);

  return { state, refetch };
}
