'use client';

import { useMemo } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getActiveEvents, type ActiveEventSummary } from '@/lib/events/getActiveEvents';

type State =
  | { status: 'loading'; events: ActiveEventSummary[]; error: null }
  | { status: 'ready'; events: ActiveEventSummary[]; error: null }
  | { status: 'error'; events: ActiveEventSummary[]; error: string };

export function useActiveEvents(): { state: State; refetch: () => void } {
  const { state: resource, refetch } = useAsyncResource<ActiveEventSummary[]>(
    () => getActiveEvents(),
    [],
  );

  const state = useMemo<State>(() => {
    if (resource.status === 'ready') return { status: 'ready', events: resource.data, error: null };
    if (resource.status === 'error')
      return { status: 'error', events: [], error: resource.message };
    return { status: 'loading', events: [], error: null };
  }, [resource]);

  return { state, refetch };
}
