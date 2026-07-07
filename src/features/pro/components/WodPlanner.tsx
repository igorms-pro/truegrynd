'use client';

import { Dumbbell, Pencil, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getWeekWods, programGymWod, type GymWod } from '@/features/gym/services/wods';
import { FORM_INPUT_CLASS } from '@/features/pro/lib/formStyles';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { ScoreType } from '@/lib/types/database.types';

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function WodForm({
  date,
  initial,
  onSaved,
  onClose,
}: {
  date: string;
  initial: GymWod | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const t = useTranslations('pro.planning.wod');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [workout, setWorkout] = useState(initial?.workout ?? '');
  const [scoreType, setScoreType] = useState<ScoreType>(initial?.scoreType ?? 'time');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function save() {
    if (title.trim().length < 2) return;
    setBusy(true);
    setError(false);
    try {
      await programGymWod({ wodDate: date, title, workout, scoreType });
      onSaved();
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-border border-l-2 border-l-primary bg-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em]">
        {t('formTitle')} <span className="font-normal text-muted-foreground">{date}</span>
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('title')}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            className={FORM_INPUT_CLASS}
          />
        </label>
        <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('scoreType')}
          <div className="mt-2 flex gap-2">
            {(['time', 'reps'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setScoreType(st)}
                className={`rounded-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] ${
                  scoreType === st
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`scoreTypes.${st}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('spec')}
        <textarea
          rows={4}
          value={workout}
          onChange={(e) => setWorkout(e.target.value)}
          placeholder={t('specPlaceholder')}
          className={`${FORM_INPUT_CLASS} resize-y`}
        />
      </label>
      {error ? <p className="text-xs font-semibold text-primary">{t('error')}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy || title.trim().length < 2}
          onClick={save}
          className="rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? t('saving') : t('save')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="rounded-md border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}

/**
 * The week's WOD programming strip (/pro/planning): one cell per day — the programmed WOD
 * or a "+ program" action. Booking cards & "Ma salle" read the same data (V4-03 loop).
 */
export function WodPlanner({ monday, canManage }: { monday: string; canManage: boolean }) {
  const t = useTranslations('pro.planning.wod');
  const locale = useLocale();
  const load = useCallback(() => getWeekWods(monday), [monday]);
  const { state, refetch } = useAsyncResource(load, [monday]);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const wods = state.status === 'ready' ? state.data : new Map<string, never>();
  const dayLabel = (i: number) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
      new Date(`${addDays(monday, i)}T00:00:00`),
    );

  return (
    <div className="space-y-3">
      <h2 className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        <Dumbbell className="h-4 w-4 text-primary" aria-hidden />
        {t('stripTitle')}
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(monday, i);
          const wod = wods.get(date) as GymWod | undefined;
          return (
            <div
              key={date}
              className={`rounded-md border p-2 ${
                wod ? 'border-primary/40 bg-primary/5' : 'border-dashed border-border'
              }`}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                {dayLabel(i)} {date.slice(8)}
              </p>
              {wod ? (
                <div className="mt-1 flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-bold" title={wod.title}>
                    {wod.title}
                  </p>
                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => setEditingDate(date)}
                      aria-label={t('edit')}
                      className="shrink-0 rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-3 w-3" aria-hidden />
                    </button>
                  ) : null}
                </div>
              ) : canManage ? (
                <button
                  type="button"
                  onClick={() => setEditingDate(date)}
                  className="mt-1 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground hover:text-primary"
                >
                  <Plus className="h-3 w-3" aria-hidden />
                  {t('program')}
                </button>
              ) : (
                <p className="mt-1 text-[10px] text-muted-foreground/60">—</p>
              )}
            </div>
          );
        })}
      </div>
      {editingDate ? (
        <WodForm
          date={editingDate}
          initial={(wods.get(editingDate) as GymWod | undefined) ?? null}
          onSaved={() => {
            setEditingDate(null);
            refetch();
          }}
          onClose={() => setEditingDate(null)}
        />
      ) : null}
    </div>
  );
}
