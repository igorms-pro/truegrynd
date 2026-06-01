'use client';

import { useCallback, useEffect, useState } from 'react';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import {
  getClanHudData,
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
  const appProfile = useOptionalAppProfile();
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!appProfile?.faction) return;
    const faction = appProfile.faction;

    let cancelled = false;
    void (async () => {
      try {
        const { rankings, members } = await getClanHudData({ faction });
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
  }, [appProfile, reloadKey]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((k) => k + 1);
  }, []);

  return { state, refetch };
}
