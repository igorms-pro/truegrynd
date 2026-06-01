'use client';

import { useEffect, useState } from 'react';

import {
  fetchEventBySlug,
  fetchEventRecap,
  fetchEventStandings,
  type EventDetail,
  type EventRecapRow,
  type EventStanding,
} from '@/features/events/services/events';
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

const empty = { standings: [] as EventStanding[], recap: [] as EventRecapRow[] };

export function useEventDetail(
  slug: string,
  division: Division,
): { state: State; refetch: () => void } {
  const [state, setState] = useState<State>({
    status: 'loading',
    event: null,
    ...empty,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const event = await fetchEventBySlug(slug);
        if (!event) {
          if (!cancelled) setState({ status: 'not_found', event: null, ...empty, error: null });
          return;
        }

        const [standings, recap] = await Promise.all([
          fetchEventStandings(event.id, division),
          event.status === 'completed' ? fetchEventRecap(event.id) : Promise.resolve([]),
        ]);

        if (!cancelled) {
          setState({ status: 'ready', event, standings, recap, error: null });
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) {
          setState({ status: 'error', event: null, ...empty, error: message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, division, reloadKey]);

  return {
    state,
    refetch: () => {
      setState({ status: 'loading', event: null, ...empty, error: null });
      setReloadKey((k) => k + 1);
    },
  };
}
