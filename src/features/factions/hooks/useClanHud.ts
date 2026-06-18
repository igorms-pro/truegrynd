'use client';

import { useMemo } from 'react';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import {
  getClanHudData,
  type ClanHudData,
  type FactionRow,
  type MemberRow,
} from '@/features/factions/services/clanHud';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { Faction } from '@/lib/types/database.types';

type ReadyState = ClanHudData & {
  status: 'ready';
  error: null;
  faction: Faction;
};

type State =
  | { status: 'loading'; rankings: null; members: null; error: null; war: null; myContribution: 0 }
  | ReadyState
  | { status: 'error'; rankings: null; members: null; error: string; war: null; myContribution: 0 };

export function useClanHud(): { state: State; refetch: () => void } {
  const appProfile = useOptionalAppProfile();
  const faction = appProfile?.faction ?? null;

  const { state: resource, refetch } = useAsyncResource<ClanHudData>(
    () =>
      getClanHudData({
        faction: faction as Faction,
        division: appProfile!.division,
        userId: appProfile!.id,
      }),
    [appProfile],
    { enabled: faction !== null },
  );

  const state = useMemo<State>(() => {
    if (resource.status === 'ready' && faction)
      return { status: 'ready', ...resource.data, error: null, faction };
    if (resource.status === 'error')
      return {
        status: 'error',
        rankings: null,
        members: null,
        error: resource.message,
        war: null,
        myContribution: 0,
      };
    return {
      status: 'loading',
      rankings: null,
      members: null,
      error: null,
      war: null,
      myContribution: 0,
    };
  }, [resource, faction]);

  return { state, refetch };
}

export type { FactionRow, MemberRow };
