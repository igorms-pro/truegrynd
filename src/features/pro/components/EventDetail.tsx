'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { Leaderboard } from '@/features/challenges/components/Leaderboard';
import {
  cancelGymEvent,
  getGymEvent,
  updateGymEvent,
  type GymEvent,
} from '@/features/pro/services/events';
import { ScoreSubmissionForm } from '@/features/submission/components/ScoreSubmissionForm';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { isGymStaff } from '@/lib/roles';

/** ISO → value for <input type="datetime-local"> (local time, no seconds). */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Phase = 'upcoming' | 'live' | 'ended';

function phaseOf(event: GymEvent): Phase {
  const now = Date.now();
  if (now < new Date(event.startsAt).getTime()) return 'upcoming';
  if (now > new Date(event.endsAt).getTime()) return 'ended';
  return 'live';
}

function EditEventForm({
  event,
  onSaved,
  onClose,
}: {
  event: GymEvent;
  onSaved: () => void;
  onClose: () => void;
}) {
  const t = useTranslations('pro.events');
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [startsAt, setStartsAt] = useState(toLocalInput(event.startsAt));
  const [endsAt, setEndsAt] = useState(toLocalInput(event.endsAt));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await updateGymEvent({ id: event.id, title, description, startsAt, endsAt });
      onSaved();
    } catch {
      setError(t('manage.error'));
      setBusy(false);
    }
  }

  const inputCls =
    'mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4">
      <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('create.fields.title')}
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </label>
      <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('create.fields.description')}
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputCls} resize-y`}
        />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('create.fields.startsAt')}
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('create.fields.endsAt')}
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>
      {error ? <p className="text-xs font-semibold text-primary">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? t('manage.saving') : t('manage.save')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="rounded-md border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {t('manage.cancelEdit')}
        </button>
      </div>
    </div>
  );
}

function EventBody({ event, onChanged }: { event: GymEvent; onChanged: () => void }) {
  const t = useTranslations('pro.events');
  const locale = useLocale();
  const router = useRouter();
  const profile = useOptionalAppProfile();
  const phase = phaseOf(event);
  const canManage = isGymStaff(profile);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [done, setDone] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function doCancel() {
    setCancelling(true);
    try {
      await cancelGymEvent(event.id);
      router.push(`/${locale}/app/pro/events`);
    } catch {
      setCancelling(false);
    }
  }

  const formatWindow = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <section className="space-y-6">
      <Link
        href={`/${locale}/app/pro/events`}
        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('detail.back')}
      </Link>

      <header className="space-y-2">
        <span className="inline-flex items-center rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t(`phase.${phase}`)}
        </span>
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{event.title}</h1>
        <p className="text-sm text-muted-foreground">
          {formatWindow(event.startsAt)} → {formatWindow(event.endsAt)}
        </p>
        {canManage && !editing ? (
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-sm border border-border px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
            >
              {t('manage.edit')}
            </button>
            <button
              type="button"
              disabled={cancelling}
              onClick={doCancel}
              className="rounded-sm border border-primary/40 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary hover:opacity-80 disabled:opacity-50"
            >
              {cancelling ? t('manage.cancelling') : t('manage.cancel')}
            </button>
          </div>
        ) : null}
      </header>

      {editing ? (
        <EditEventForm
          event={event}
          onSaved={() => {
            setEditing(false);
            onChanged();
          }}
          onClose={() => setEditing(false)}
        />
      ) : null}

      {!editing && event.description ? (
        <p className="text-sm text-muted-foreground">{event.description}</p>
      ) : null}

      {event.workout ? (
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('detail.workout')}
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-foreground">
            {event.workout}
          </pre>
        </div>
      ) : null}

      {/* Score submission flows through the same core pipeline as the B2C arena. */}
      {phase === 'live' && event.challengeId ? (
        done ? (
          <p className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
            {t('detail.submitted')}
          </p>
        ) : submitting ? (
          <div className="rounded-md border border-border bg-card p-4">
            <ScoreSubmissionForm
              challengeId={event.challengeId}
              scoreType={event.scoreType}
              availableVariants={['standard']}
              onSubmitted={() => {
                setSubmitting(false);
                setDone(true);
                setReloadKey((k) => k + 1);
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSubmitting(true)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('detail.submit')}
          </button>
        )
      ) : null}

      <div className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('detail.standings')}
        </h2>
        {event.challengeId ? (
          <Leaderboard
            key={`${event.challengeId}-${reloadKey}-${profile?.id ?? ''}`}
            challengeId={event.challengeId}
            scoreType={event.scoreType}
            availableVariants={['standard']}
            mode="full"
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t('detail.noStandings')}</p>
        )}
      </div>
    </section>
  );
}

export function EventDetail({ eventId }: { eventId: string }) {
  const t = useTranslations('pro.events');
  const load = useCallback(() => getGymEvent(eventId), [eventId]);
  const { state, refetch } = useAsyncResource(load, [eventId]);

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error' || !state.data) {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }
  return <EventBody event={state.data} onChanged={refetch} />;
}
