'use client';

import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { Leaderboard } from '@/features/challenges/components/Leaderboard';
import { WeekScheduleGrid, type ScheduleSlot } from '@/features/gym/components/WeekScheduleGrid';
import {
  bookSession,
  cancelBooking,
  getWeekBookings,
  mondayOf,
} from '@/features/gym/services/bookings';
import { getWeekWods, type GymWod } from '@/features/gym/services/wods';
import { GYM_EVENT_VARIANTS } from '@/features/pro/services/events';
import { listGymClasses } from '@/features/pro/services/planning';
import { ScoreSubmissionForm } from '@/features/submission/components/ScoreSubmissionForm';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { supabase } from '@/lib/supabase';

type GymHeader = { name: string; slug: string };

async function getGymHeader(gymId: string): Promise<GymHeader> {
  const { data, error } = await supabase
    .from('gyms')
    .select('name, slug')
    .eq('id', gymId)
    .maybeSingle<GymHeader>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('gym_not_found');
  return data;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Member view of their own gym: weekly schedule with live booking (V4-02). */
export function MyGymScreen() {
  const t = useTranslations('myGym');
  const locale = useLocale();
  const profile = useOptionalAppProfile();
  const gymId = profile?.affiliated_gym_id ?? null;
  // 0 = current week, 1 = next week (booking horizon is 14 days server-side).
  const [weekOffset, setWeekOffset] = useState(0);
  const monday = addDays(mondayOf(new Date()), weekOffset * 7);
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [actionError, setActionError] = useState(false);

  const load = useCallback(async () => {
    const [gym, classes, bookings, wods] = await Promise.all([
      getGymHeader(gymId ?? ''),
      listGymClasses(gymId ?? ''),
      getWeekBookings(monday),
      getWeekWods(monday),
    ]);
    const slots: ScheduleSlot[] = classes
      .filter((c) => c.isActive)
      .map((c) => {
        const b = bookings.get(c.id);
        return {
          ...c,
          bookedCount: b?.bookedCount ?? 0,
          waitlistCount: b?.waitlistCount ?? 0,
          sessionDate: b?.sessionDate ?? addDays(monday, c.weekday),
          myStatus: b?.myStatus ?? null,
          myBookingId: b?.myBookingId ?? null,
        };
      });
    return { gym, slots, wods };
  }, [gymId, monday]);
  const { state, refetch } = useAsyncResource(load, [gymId ?? '', monday], {
    enabled: gymId !== null,
  });

  const act = useCallback(
    async (slot: ScheduleSlot, action: 'book' | 'cancel') => {
      if (!slot.sessionDate) return;
      setBusySlot(slot.id);
      setActionError(false);
      try {
        if (action === 'book') await bookSession(slot.id, slot.sessionDate);
        else if (slot.myBookingId) await cancelBooking(slot.myBookingId);
        refetch();
      } catch {
        setActionError(true);
      } finally {
        setBusySlot(null);
      }
    },
    [refetch],
  );

  if (!gymId) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          {t('noGym')}
        </p>
      </section>
    );
  }
  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }

  const { gym, slots, wods } = state.data;
  const today = todayIso();
  const todayWod = wods.get(today) ?? null;

  const bookingFooter = (slot: ScheduleSlot) => {
    const date = slot.sessionDate ?? '';
    if (date < today) return null;
    // Today's slots whose start time already passed can't be booked (server rejects too).
    if (date === today) {
      const now = new Date();
      const nowHm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (slot.startTime <= nowHm && !slot.myStatus) return null;
    }
    const busy = busySlot === slot.id;
    const full = (slot.bookedCount ?? 0) >= slot.capacity;

    if (slot.myStatus === 'confirmed') {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => act(slot, 'cancel')}
          className="inline-flex w-full items-center justify-center gap-1 rounded-sm bg-emerald-600/90 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white hover:opacity-90 disabled:opacity-50"
          title={t('booking.cancelHint')}
        >
          <Check className="h-3 w-3" aria-hidden />
          {busy ? t('booking.busy') : t('booking.booked')}
        </button>
      );
    }
    if (slot.myStatus === 'waitlisted') {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => act(slot, 'cancel')}
          className="inline-flex w-full items-center justify-center gap-1 rounded-sm bg-amber-500/20 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-amber-500 hover:opacity-80 disabled:opacity-50"
          title={t('booking.cancelHint')}
        >
          <Clock className="h-3 w-3" aria-hidden />
          {busy ? t('booking.busy') : t('booking.waitlisted')}
        </button>
      );
    }
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => act(slot, 'book')}
        className={`w-full rounded-sm px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] disabled:opacity-50 ${
          full
            ? 'border border-border text-muted-foreground hover:text-foreground'
            : 'bg-primary text-primary-foreground hover:opacity-90'
        }`}
      >
        {busy ? t('booking.busy') : full ? t('booking.joinWaitlist') : t('booking.book')}
      </button>
    );
  };

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
          {t('kicker')}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{gym.name}</h1>
          <Link
            href={`/${locale}/app/gym/${gym.slug}`}
            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            {t('publicPage')}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {t('scheduleTitle')}
          </h2>
          <div className="inline-flex items-center gap-1 rounded-md border border-border">
            <button
              type="button"
              disabled={weekOffset === 0}
              onClick={() => setWeekOffset(0)}
              aria-label={t('booking.prevWeek')}
              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <span className="min-w-[9rem] text-center text-[10px] font-black uppercase tracking-[0.14em]">
              {weekOffset === 0 ? t('booking.thisWeek') : t('booking.nextWeek')}
            </span>
            <button
              type="button"
              disabled={weekOffset === 1}
              onClick={() => setWeekOffset(1)}
              aria-label={t('booking.nextWeek')}
              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {actionError ? (
          <p className="text-xs font-semibold text-primary">{t('booking.error')}</p>
        ) : null}

        {slots.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            {t('scheduleEmpty')}
          </p>
        ) : (
          <WeekScheduleGrid
            classes={slots}
            weekStart={monday}
            footer={bookingFooter}
            dayBadge={(weekday) => {
              const wod = wods.get(addDays(monday, weekday));
              if (!wod) return null;
              return (
                <p
                  className="truncate rounded-sm bg-primary/10 px-1.5 py-1 text-center text-[9px] font-black uppercase tracking-[0.1em] text-primary"
                  title={wod.workout}
                >
                  {wod.title}
                </p>
              );
            }}
          />
        )}
      </div>

      {todayWod ? <TodayWodPanel wod={todayWod} /> : null}
    </section>
  );
}

/** The day's WOD: spec + score submission + the class/day leaderboard (the V4-03 loop). */
function TodayWodPanel({ wod }: { wod: GymWod }) {
  const t = useTranslations('myGym.wod');
  const profile = useOptionalAppProfile();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border border-l-2 border-l-primary bg-card p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
          {t('todayTitle')}
        </p>
        <h2 className="mt-1 text-lg font-black uppercase tracking-tight">{wod.title}</h2>
        {wod.workout && wod.workout !== wod.title ? (
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-foreground">
            {wod.workout}
          </pre>
        ) : null}

        <div className="mt-4">
          {done ? (
            <p className="text-sm text-muted-foreground">{t('submitted')}</p>
          ) : submitting ? (
            <ScoreSubmissionForm
              challengeId={wod.challengeId}
              scoreType={wod.scoreType}
              availableVariants={GYM_EVENT_VARIANTS}
              onSubmitted={() => {
                setSubmitting(false);
                setDone(true);
                setReloadKey((k) => k + 1);
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setSubmitting(true)}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('submit')}
            </button>
          )}
        </div>
      </div>

      <Leaderboard
        key={`${wod.challengeId}-${reloadKey}-${profile?.id ?? ''}`}
        challengeId={wod.challengeId}
        scoreType={wod.scoreType}
        availableVariants={GYM_EVENT_VARIANTS}
        mode="full"
      />
    </div>
  );
}
