'use client';

import { useMemo } from 'react';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { parseFactionSlug } from '@/features/factions/lib/factionSlug';
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
  faction: Faction;
  error: null;
};

type State =
  | { status: 'loading'; faction: Faction | null; rankings: null; members: null; error: null }
  | ReadyState
  | { status: 'invalid'; faction: null; rankings: null; members: null; error: null }
  | { status: 'error'; faction: Faction | null; rankings: null; members: null; error: string };

export function useFactionPage(slug: string): { state: State; refetch: () => void } {
  const parsed = parseFactionSlug(slug);
  const appProfile = useOptionalAppProfile();

  const { state: resource, refetch } = useAsyncResource<ClanHudData>(
    () =>
      getClanHudData({
        faction: parsed as Faction,
        division: appProfile!.division,
        userId: appProfile!.id,
        limit: 10,
      }),
    [parsed, appProfile],
    { enabled: parsed !== null && Boolean(appProfile?.division) },
  );

  const state = useMemo<State>(() => {
    if (!parsed)
      return { status: 'invalid', faction: null, rankings: null, members: null, error: null };
    if (resource.status === 'ready')
      return { status: 'ready', faction: parsed, ...resource.data, error: null };
    if (resource.status === 'error')
      return {
        status: 'error',
        faction: parsed,
        rankings: null,
        members: null,
        error: resource.message,
      };
    return { status: 'loading', faction: parsed, rankings: null, members: null, error: null };
  }, [parsed, resource]);

  return { state, refetch };
}

export type { FactionRow, MemberRow };
