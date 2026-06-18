'use client';

import { useEffect, useState } from 'react';

import {
  listRecentFactionVideos,
  type FactionProofRow,
} from '@/features/factions/services/clanHud';
import type { Faction } from '@/lib/types/database.types';

type State =
  | { status: 'loading'; rows: [] }
  | { status: 'ready'; rows: FactionProofRow[] }
  | { status: 'error'; rows: [] };

export function useFactionRecentVideos(faction: Faction | null): State {
  const [state, setState] = useState<State>({ status: 'loading', rows: [] });

  useEffect(() => {
    if (!faction) return undefined;
    let cancelled = false;
    void (async () => {
      try {
        const rows = await listRecentFactionVideos(faction);
        if (!cancelled) setState({ status: 'ready', rows });
      } catch {
        if (!cancelled) setState({ status: 'error', rows: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [faction]);

  return state;
}
