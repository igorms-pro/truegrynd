'use client';

import { useCallback, useEffect, useState } from 'react';

import { parseFactionSlug } from '@/features/factions/lib/factionSlug';
import {
  getClanHudData,
  type FactionRow,
  type MemberRow,
} from '@/features/factions/services/clanHud';
import type { Faction } from '@/lib/types/database.types';

type State =
  | { status: 'loading'; faction: Faction | null; rankings: null; members: null; error: null }
  | {
      status: 'ready';
      faction: Faction;
      rankings: FactionRow[];
      members: MemberRow[];
      error: null;
    }
  | { status: 'invalid'; faction: null; rankings: null; members: null; error: null }
  | { status: 'error'; faction: Faction | null; rankings: null; members: null; error: string };

const initial: State = {
  status: 'loading',
  faction: null,
  rankings: null,
  members: null,
  error: null,
};

export function useFactionPage(slug: string): { state: State; refetch: () => void } {
  const parsed = parseFactionSlug(slug);
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!parsed) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const { rankings, members } = await getClanHudData({ faction: parsed, limit: 10 });
        if (cancelled) return;
        setState({
          status: 'ready',
          faction: parsed,
          rankings,
          members,
          error: null,
        });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) {
          setState({
            status: 'error',
            faction: parsed,
            rankings: null,
            members: null,
            error: message,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [parsed, reloadKey]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((k) => k + 1);
  }, []);

  if (!parsed) {
    return {
      state: { status: 'invalid', faction: null, rankings: null, members: null, error: null },
      refetch,
    };
  }

  return { state, refetch };
}
