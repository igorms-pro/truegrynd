'use client';

import { useCallback, useEffect, useState } from 'react';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import {
  getClanHudData,
  type ClanHudData,
  type FactionRow,
  type MemberRow,
} from '@/features/factions/services/clanHud';
import type { Faction } from '@/lib/types/database.types';

type ReadyState = ClanHudData & {
  status: 'ready';
  error: null;
  faction: Faction;
};

type State =
  | { status: 'loading'; rankings: null; members: null; error: null; war: null; myContribution: 0 }
  | ReadyState
  | {
      status: 'error';
      rankings: null;
      members: null;
      error: string;
      war: null;
      myContribution: 0;
    };

const initial: State = {
  status: 'loading',
  rankings: null,
  members: null,
  error: null,
  war: null,
  myContribution: 0,
};

export function useClanHud(): { state: State; refetch: () => void } {
  const appProfile = useOptionalAppProfile();
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!appProfile?.faction) return;
    const faction = appProfile.faction;
    const division = appProfile.division;

    let cancelled = false;
    void (async () => {
      try {
        const data = await getClanHudData({
          faction,
          division,
          userId: appProfile.id,
        });
        if (cancelled) return;
        setState({
          status: 'ready',
          ...data,
          error: null,
          faction,
        });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled)
          setState({
            status: 'error',
            rankings: null,
            members: null,
            error: message,
            war: null,
            myContribution: 0,
          });
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

export type { FactionRow, MemberRow };
