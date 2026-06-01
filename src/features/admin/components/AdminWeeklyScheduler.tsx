'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useAdminWeeklyScheduler } from '@/features/admin/hooks/useAdminWeeklyScheduler';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/weekly';
import type { WeeklyChallengeStatus } from '@/lib/types/database.types';

const STATUSES: WeeklyChallengeStatus[] = ['scheduled', 'active', 'completed', 'cancelled'];

function defaultWindow(): { startsAt: string; endsAt: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  sunday.setHours(23, 59, 0, 0);
  return { startsAt: monday.toISOString(), endsAt: sunday.toISOString() };
}

export function AdminWeeklyScheduler() {
  const t = useTranslations('admin.weekly');
  const { state, refetch, save, saving, saveError } = useAdminWeeklyScheduler();
  const defaults = useMemo(() => defaultWindow(), []);
  const [challengeId, setChallengeId] = useState('');
  const [startsAt, setStartsAt] = useState(toDatetimeLocalValue(defaults.startsAt));
  const [endsAt, setEndsAt] = useState(toDatetimeLocalValue(defaults.endsAt));
  const [status, setStatus] = useState<WeeklyChallengeStatus>('active');
  const [weekLabel, setWeekLabel] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const challenges = state.status === 'ready' ? state.challenges : [];

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!challengeId) return;
    await save({
      id: editId,
      challengeId,
      startsAt: fromDatetimeLocalValue(startsAt),
      endsAt: fromDatetimeLocalValue(endsAt),
      status,
      weekLabel: weekLabel.trim() || null,
    });
    setEditId(null);
    setWeekLabel('');
  };

  const loadRow = (row: (typeof state.rows)[number]) => {
    setEditId(row.id);
    setChallengeId(row.challenge_id);
    setStartsAt(toDatetimeLocalValue(row.starts_at));
    setEndsAt(toDatetimeLocalValue(row.ends_at));
    setStatus(row.status);
    setWeekLabel(row.week_label ?? '');
  };

  if (state.status === 'loading') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{t('error')}</p>
        <button
          type="button"
          onClick={refetch}
          className="rounded-md border border-border bg-muted px-3 py-2 text-xs font-black uppercase tracking-[0.18em]"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-border bg-card p-4">
        <h2 className="text-sm font-black uppercase tracking-[0.18em]">
          {editId ? t('formEditTitle') : t('formCreateTitle')}
        </h2>

        <label className="block space-y-1">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('challenge')}
          </span>
          <select
            required
            value={challengeId}
            onChange={(e) => setChallengeId(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('challengePlaceholder')}</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.is_official ? '★ ' : ''}
                {c.title}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('startsAt')}
            </span>
            <input
              type="datetime-local"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('endsAt')}
            </span>
            <input
              type="datetime-local"
              required
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('status')}
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as WeeklyChallengeStatus)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`statuses.${s}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('weekLabel')}
            </span>
            <input
              type="text"
              value={weekLabel}
              onChange={(e) => setWeekLabel(e.target.value)}
              placeholder={t('weekLabelPlaceholder')}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        {saveError ? <p className="text-xs text-primary">{saveError}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || !challengeId}
            className="rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
          >
            {saving ? t('saving') : editId ? t('update') : t('create')}
          </button>
          {editId ? (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setWeekLabel('');
              }}
              className="rounded-md border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-[0.18em]"
            >
              {t('cancelEdit')}
            </button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        <h2 className="text-sm font-black uppercase tracking-[0.18em]">{t('listTitle')}</h2>
        {state.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {state.rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">
                    {row.week_label ?? row.challenge?.title ?? row.challenge_id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.challenge?.title} · {t(`statuses.${row.status}`)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadRow(row)}
                  className="rounded-md border border-border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
                >
                  {t('edit')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
