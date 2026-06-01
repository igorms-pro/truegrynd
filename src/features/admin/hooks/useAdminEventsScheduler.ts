'use client';

import { useEffect, useState } from 'react';

import {
  adminUpsertEvent,
  listApprovedChallengesForEventPicker,
  listEventsForAdmin,
  type AdminEventRow,
} from '@/features/admin/services/adminEvents';
import type { EventStatus, EventType } from '@/lib/types/database.types';

type State =
  | {
      status: 'loading';
      rows: AdminEventRow[];
      challenges: { id: string; title: string; is_official: boolean }[];
      error: null;
    }
  | {
      status: 'ready';
      rows: AdminEventRow[];
      challenges: { id: string; title: string; is_official: boolean }[];
      error: null;
    }
  | {
      status: 'error';
      rows: AdminEventRow[];
      challenges: { id: string; title: string; is_official: boolean }[];
      error: string;
    };

const emptyLists = {
  rows: [] as AdminEventRow[],
  challenges: [] as { id: string; title: string; is_official: boolean }[],
};

export function useAdminEventsScheduler(): {
  state: State;
  refetch: () => void;
  save: (input: {
    id?: string | null;
    slug: string;
    title: string;
    description?: string;
    eventType: EventType;
    startsAt: string;
    endsAt: string;
    status: EventStatus;
    challengeIds: string[];
  }) => Promise<void>;
  saving: boolean;
  saveError: string | null;
} {
  const [state, setState] = useState<State>({ status: 'loading', ...emptyLists, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [rows, challenges] = await Promise.all([
          listEventsForAdmin(),
          listApprovedChallengesForEventPicker(),
        ]);
        if (!cancelled) setState({ status: 'ready', rows, challenges, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', ...emptyLists, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refetch = () => {
    setState({ status: 'loading', ...emptyLists, error: null });
    setReloadKey((k) => k + 1);
  };

  const save = async (input: {
    id?: string | null;
    slug: string;
    title: string;
    description?: string;
    eventType: EventType;
    startsAt: string;
    endsAt: string;
    status: EventStatus;
    challengeIds: string[];
  }) => {
    setSaving(true);
    setSaveError(null);
    try {
      await adminUpsertEvent(input);
      refetch();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'unknown');
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return { state, refetch, save, saving, saveError };
}
