'use client';

import { Check, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { FilterSelect } from '@/components/FilterSelect';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { WeekScheduleGrid, type ScheduleSlot } from '@/features/gym/components/WeekScheduleGrid';
import {
  getSessionRoster,
  getWeekBookings,
  mondayOf,
  toggleCheckin,
} from '@/features/gym/services/bookings';
import { WodPlanner } from '@/features/pro/components/WodPlanner';
import { FORM_INPUT_CLASS } from '@/features/pro/lib/formStyles';
import {
  CLASS_TYPES,
  createGymClass,
  deleteGymClass,
  listGymClasses,
  updateGymClass,
  type ClassType,
  type GymClass,
  type GymClassInput,
} from '@/features/pro/services/planning';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { canAccessPro } from '@/lib/roles';

const DURATIONS = [45, 60, 75, 90, 120] as const;

const EMPTY_FORM: GymClassInput = {
  title: '',
  classType: 'wod',
  weekday: 0,
  startTime: '18:00',
  durationMin: 60,
  capacity: 16,
  coachId: null,
};

function weekdayShort(locale: string, weekday: number): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
    new Date(Date.UTC(2024, 0, 1 + weekday)),
  );
}

function SlotForm({
  initial,
  busyLabel,
  submitLabel,
  onSubmit,
  onClose,
}: {
  initial: GymClassInput;
  busyLabel: string;
  submitLabel: string;
  onSubmit: (input: GymClassInput) => Promise<void>;
  onClose: () => void;
}) {
  const t = useTranslations('pro.planning');
  const tType = useTranslations('gym.schedule.type');
  const locale = useLocale();
  const [form, setForm] = useState<GymClassInput>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const canSubmit = form.title.trim().length >= 2 && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(false);
    try {
      await onSubmit(form);
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  const set = <K extends keyof GymClassInput>(key: K, value: GymClassInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4 rounded-md border border-border bg-card p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('form.title')}
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder={t('form.titlePlaceholder')}
            className={FORM_INPUT_CLASS}
          />
        </label>
        <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('form.type')}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CLASS_TYPES.map((ct) => (
              <button
                key={ct}
                type="button"
                onClick={() => set('classType', ct as ClassType)}
                className={`rounded-sm px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${
                  form.classType === ct
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {tType(ct)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('form.weekday')}
        <div className="mt-2 inline-flex overflow-hidden rounded-md border border-border">
          {Array.from({ length: 7 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => set('weekday', i)}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${
                i > 0 ? 'border-l border-border' : ''
              } ${
                form.weekday === i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              {weekdayShort(locale, i)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('form.startTime')}
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => set('startTime', e.target.value)}
            className={FORM_INPUT_CLASS}
          />
        </label>
        <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('form.duration')}
          <div className="mt-2">
            <FilterSelect
              value={String(form.durationMin)}
              onChange={(v) => set('durationMin', Number(v) || 60)}
              options={DURATIONS.map((d) => ({
                value: String(d),
                label: t('form.minutes', { min: d }),
              }))}
              allLabel={t('form.minutes', { min: 60 })}
              ariaLabel={t('form.duration')}
            />
          </div>
        </div>
        <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('form.capacity')}
          <input
            type="number"
            min={1}
            max={500}
            value={form.capacity}
            onChange={(e) => set('capacity', Math.max(1, Number(e.target.value) || 1))}
            className={FORM_INPUT_CLASS}
          />
        </label>
      </div>

      {error ? <p className="text-xs font-semibold text-primary">{t('form.error')}</p> : null}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? busyLabel : submitLabel}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="rounded-md border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {t('form.cancel')}
        </button>
      </div>
    </div>
  );
}

function RosterPanel({ slot, onClose }: { slot: ScheduleSlot; onClose: () => void }) {
  const t = useTranslations('pro.planning.roster');
  const date = slot.sessionDate ?? '';
  const load = useCallback(() => getSessionRoster(slot.id, date), [slot.id, date]);
  const { state, refetch } = useAsyncResource(load, [slot.id, date]);
  const [busyCheckin, setBusyCheckin] = useState<string | null>(null);
  // Check-in makes sense once the session day has arrived.
  const canCheckin = date <= new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em]">
          {slot.title} · {slot.startTime}
          <span className="ml-2 font-normal normal-case text-muted-foreground">{date}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm border border-border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
        >
          {t('close')}
        </button>
      </div>
      {state.status === 'loading' || state.status === 'idle' ? (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      ) : state.status === 'error' ? (
        <p className="text-sm font-semibold text-primary">{t('error')}</p>
      ) : state.data.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {state.data.map((r) => (
            <li key={r.bookingId} className="flex items-center gap-3 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-black">
                {(r.username ?? '?').slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{r.username ?? '—'}</span>
              {r.division ? (
                <span className="hidden shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground sm:block">
                  {r.division}
                </span>
              ) : null}
              <span className="w-14 shrink-0 text-right text-sm font-black tabular-nums">
                {r.rating ?? '—'}
              </span>
              <span
                className={`hidden w-24 shrink-0 text-right text-[10px] font-black uppercase tracking-[0.12em] sm:block ${
                  r.status === 'confirmed' ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {t(`status.${r.status}`)}
              </span>
              {canCheckin ? (
                <button
                  type="button"
                  disabled={busyCheckin === r.userId}
                  onClick={async () => {
                    setBusyCheckin(r.userId);
                    try {
                      await toggleCheckin(r.sessionId, r.userId, !r.checkedIn);
                      refetch();
                    } finally {
                      setBusyCheckin(null);
                    }
                  }}
                  className={`inline-flex w-28 shrink-0 items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-50 ${
                    r.checkedIn
                      ? 'bg-emerald-600 text-white hover:opacity-90'
                      : 'border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r.checkedIn ? (
                    <>
                      <Check className="h-3 w-3" aria-hidden />
                      {t('present')}
                    </>
                  ) : (
                    t('markPresent')
                  )}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PlanningScreen() {
  const t = useTranslations('pro.planning');
  const profile = useOptionalAppProfile();
  const gymId = profile?.affiliated_gym_id ?? null;
  // Staff of the gym, or the platform/gym owner overseeing it — matches the RLS write policy.
  const canManage = canAccessPro(profile);
  const monday = mondayOf(new Date());

  const load = useCallback(async () => {
    const [classes, bookings] = await Promise.all([
      listGymClasses(gymId ?? ''),
      getWeekBookings(monday),
    ]);
    return classes.map((c): ScheduleSlot => {
      const b = bookings.get(c.id);
      return {
        ...c,
        bookedCount: b?.bookedCount ?? 0,
        waitlistCount: b?.waitlistCount ?? 0,
        sessionDate: b?.sessionDate,
      };
    });
  }, [gymId, monday]);
  const { state, refetch } = useAsyncResource(load, [gymId ?? ''], { enabled: gymId !== null });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GymClass | null>(null);
  const [selected, setSelected] = useState<ScheduleSlot | null>(null);

  if (!gymId) {
    return <p className="text-sm text-muted-foreground">{t('noGym')}</p>;
  }
  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }

  const classes = state.data;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {canManage && !creating && !editing ? (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('add')}
          </button>
        ) : null}
      </header>

      <WodPlanner monday={monday} canManage={canManage} />

      {creating ? (
        <SlotForm
          initial={EMPTY_FORM}
          busyLabel={t('form.saving')}
          submitLabel={t('form.create')}
          onSubmit={async (input) => {
            await createGymClass(gymId, input);
            setCreating(false);
            refetch();
          }}
          onClose={() => setCreating(false)}
        />
      ) : null}

      {editing ? (
        <SlotForm
          initial={{
            title: editing.title,
            classType: editing.classType,
            weekday: editing.weekday,
            startTime: editing.startTime,
            durationMin: editing.durationMin,
            capacity: editing.capacity,
            coachId: editing.coachId,
          }}
          busyLabel={t('form.saving')}
          submitLabel={t('form.save')}
          onSubmit={async (input) => {
            await updateGymClass(editing.id, input);
            setEditing(null);
            refetch();
          }}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {classes.length === 0 && !creating ? (
        <div className="space-y-4 rounded-md border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.14em]">{t('emptyTitle')}</p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{t('emptyBody')}</p>
          {canManage ? (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t('add')}
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <WeekScheduleGrid
            classes={classes}
            weekStart={monday}
            onCardClick={canManage ? (c) => setSelected(c) : undefined}
            onEdit={canManage ? (c) => setEditing(c) : undefined}
            onDelete={
              canManage
                ? async (c) => {
                    await deleteGymClass(c.id);
                    refetch();
                  }
                : undefined
            }
          />
          {selected ? <RosterPanel slot={selected} onClose={() => setSelected(null)} /> : null}
        </>
      )}
    </div>
  );
}
