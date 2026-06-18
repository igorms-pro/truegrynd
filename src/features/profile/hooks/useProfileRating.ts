'use client';

import { useMemo } from 'react';

import { fetchProfileRating } from '@/features/profile/services/profileRating';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { ProfileRating } from '@/lib/rating';

type State =
  | { status: 'loading'; rating: null; error: null }
  | { status: 'error'; rating: null; error: string }
  | { status: 'ready'; rating: ProfileRating | null; error: null };

export function useProfileRating(userId: string | null): {
  state: State;
  refetch: () => void;
} {
  const { state: resource, refetch } = useAsyncResource<ProfileRating | null>(
    () => fetchProfileRating(userId as string),
    [userId],
    { enabled: userId !== null },
  );

  const state = useMemo<State>(() => {
    if (resource.status === 'ready') return { status: 'ready', rating: resource.data, error: null };
    if (resource.status === 'error')
      return { status: 'error', rating: null, error: resource.message };
    return { status: 'loading', rating: null, error: null };
  }, [resource]);

  return { state, refetch };
}
