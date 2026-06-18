'use client';

import { useMemo } from 'react';

import {
  listRecentFactionVideos,
  type FactionProofRow,
} from '@/features/factions/services/clanHud';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { Faction } from '@/lib/types/database.types';

type State =
  | { status: 'loading'; rows: [] }
  | { status: 'ready'; rows: FactionProofRow[] }
  | { status: 'error'; rows: [] };

export function useFactionRecentVideos(faction: Faction | null): State {
  const { state: resource } = useAsyncResource<FactionProofRow[]>(
    () => listRecentFactionVideos(faction as Faction),
    [faction],
    { enabled: faction !== null },
  );

  return useMemo<State>(() => {
    if (resource.status === 'ready') return { status: 'ready', rows: resource.data };
    if (resource.status === 'error') return { status: 'error', rows: [] };
    return { status: 'loading', rows: [] };
  }, [resource]);
}
