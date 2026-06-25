'use client';

import { Radio, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { listLeaderboardScores } from '@/features/challenges/services/leaderboard';
import { formatScore } from '@/features/challenges/lib/scoreFormat';
import { getGymEvent, type GymEvent } from '@/features/pro/services/events';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getFactionColorVar } from '@/lib/factionStyles';
import { supabase } from '@/lib/supabase';
import type { Faction } from '@/lib/types/database.types';

const RANK_MEDAL = ['#f5c518', '#c0c0c0', '#cd7f32'];

function Board({ event }: { event: GymEvent }) {
  const t = useTranslations('pro.events.tv');
  const challengeId = event.challengeId as string;

  const load = useCallback(
    () => listLeaderboardScores({ challengeId, scoreType: event.scoreType, limit: 30 }),
    [challengeId, event.scoreType],
  );
  const { state, refetch } = useAsyncResource(load, [challengeId]);

  // Realtime: any score change for this event's challenge re-pulls the board.
  // A slow poll is kept as a safety net if a realtime event is ever missed.
  useEffect(() => {
    const channel = supabase
      .channel(`event-tv-${challengeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores', filter: `challenge_id=eq.${challengeId}` },
        () => refetch(),
      )
      .subscribe();
    const poll = setInterval(() => refetch(), 20000);
    return () => {
      clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [challengeId, refetch]);

  const rows = state.status === 'ready' ? state.data : [];

  return (
    <div className="flex h-full flex-col">
      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-2xl font-bold text-muted-foreground">
          {state.status === 'error' ? t('error') : t('waiting')}
        </p>
      ) : (
        <ol className="flex-1 space-y-2 overflow-hidden">
          {rows.map((entry, i) => {
            const color = getFactionColorVar(entry.profile?.faction as Faction | null);
            return (
              <li
                key={entry.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-3"
                style={{ borderLeft: `6px solid ${color}` }}
              >
                <span
                  className="w-12 shrink-0 text-center text-3xl font-black tabular-nums md:text-4xl"
                  style={{ color: RANK_MEDAL[i] ?? 'inherit' }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-2xl font-black uppercase tracking-tight md:text-4xl">
                  {entry.profile?.username ?? '—'}
                </span>
                {entry.proof_level === 'judge_verified' ? (
                  <span className="shrink-0 rounded-sm bg-primary px-2 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary-foreground">
                    {t('verified')}
                  </span>
                ) : null}
                <span className="shrink-0 text-3xl font-black tabular-nums md:text-5xl">
                  {formatScore(entry.value, event.scoreType)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function EventBroadcast({ eventId }: { eventId: string }) {
  const t = useTranslations('pro.events.tv');
  const locale = useLocale();
  const load = useCallback(() => getGymEvent(eventId), [eventId]);
  const { state } = useAsyncResource(load, [eventId]);
  const event = state.status === 'ready' ? state.data : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background p-6 md:p-10">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Radio className="h-6 w-6 animate-pulse text-primary" aria-hidden />
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
              {t('badge')}
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">
              {event?.title ?? '…'}
            </h1>
          </div>
        </div>
        <Link
          href={`/${locale}/app/pro/events/${eventId}`}
          className="shrink-0 rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"
          aria-label={t('exit')}
        >
          <X className="h-6 w-6" />
        </Link>
      </header>

      {event?.challengeId ? (
        <Board event={event} />
      ) : (
        <p className="flex flex-1 items-center justify-center text-2xl font-bold text-muted-foreground">
          {state.status === 'error' ? t('error') : t('waiting')}
        </p>
      )}
    </div>
  );
}
