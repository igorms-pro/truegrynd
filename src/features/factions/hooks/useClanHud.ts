'use client';

import { useCallback, useEffect, useState } from 'react';

import { useProfile } from '@/features/profile/hooks/useProfile';
import {
  getFactionRankings,
  getTopMembersByFaction,
  type FactionRow,
  type MemberRow,
} from '@/features/factions/services/clanHud';
import type { Faction } from '@/lib/types/database.types';

type State =
  | { status: 'loading'; rankings: null; members: null; error: null }
  | { status: 'ready'; rankings: FactionRow[]; members: MemberRow[]; error: null; faction: Faction }
  | { status: 'error'; rankings: null; members: null; error: string };

const initial: State = { status: 'loading', rankings: null, members: null, error: null };

export function useClanHud(): { state: State; refetch: () => void } {
  const { state: profile } = useProfile();
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (profile.status !== 'ready') return;
    const faction = profile.profile.faction;
    if (!faction) return;

    let cancelled = false;
    void (async () => {
      try {
        const [rankings, members] = await Promise.all([
          getFactionRankings(),
          getTopMembersByFaction({ faction }),
        ]);
        if (cancelled) return;
        setState({
          status: 'ready',
          rankings,
          members,
          error: null,
          faction,
        });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled)
          setState({ status: 'error', rankings: null, members: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile, reloadKey]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((k) => k + 1);
  }, []);

  return { state, refetch };
}
