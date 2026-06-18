'use client';

import { useMemo } from 'react';

import {
  fetchEventBySlug,
  fetchEventRecap,
  fetchEventStandings,
  type EventDetail,
  type EventRecapRow,
  type EventStanding,
} from '@/features/events/services/events';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { Division } from '@/lib/types/database.types';

type State =
  | {
      status: 'loading';
      event: EventDetail | null;
      standings: EventStanding[];
      recap: EventRecapRow[];
      error: null;
    }
  | {
      status: 'ready';
      event: EventDetail;
      standings: EventStanding[];
      recap: EventRecapRow[];
      error: null;
    }
  | {
      status: 'not_found';
      event: null;
      standings: EventStanding[];
      recap: EventRecapRow[];
      error: null;
    }
  | {
      status: 'error';
      event: EventDetail | null;
      standings: EventStanding[];
      recap: EventRecapRow[];
      error: string;
    };

type Result =
  | { kind: 'found'; event: EventDetail; standings: EventStanding[]; recap: EventRecapRow[] }
  | { kind: 'not_found' };

const empty = { standings: [] as EventStanding[], recap: [] as EventRecapRow[] };

export function useEventDetail(
  slug: string,
  division: Division,
): { state: State; refetch: () => void } {
  const { state: resource, refetch } = useAsyncResource<Result>(async () => {
    const event = await fetchEventBySlug(slug);
    if (!event) return { kind: 'not_found' };
    const [standings, recap] = await Promise.all([
      fetchEventStandings(event.id, division),
      event.status === 'completed' ? fetchEventRecap(event.id) : Promise.resolve([]),
    ]);
    return { kind: 'found', event, standings, recap };
  }, [slug, division]);

  const state = useMemo<State>(() => {
    if (resource.status === 'ready') {
      return resource.data.kind === 'found'
        ? {
            status: 'ready',
            event: resource.data.event,
            standings: resource.data.standings,
            recap: resource.data.recap,
            error: null,
          }
        : { status: 'not_found', event: null, ...empty, error: null };
    }
    if (resource.status === 'error')
      return { status: 'error', event: null, ...empty, error: resource.message };
    return { status: 'loading', event: null, ...empty, error: null };
  }, [resource]);

  return { state, refetch };
}
