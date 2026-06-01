'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useAdminEventsScheduler } from '@/features/admin/hooks/useAdminEventsScheduler';
import { EVENT_TYPES } from '@/features/events/services/events';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/weekly';
import type { EventStatus, EventType } from '@/lib/types/database.types';

const STATUSES: EventStatus[] = ['scheduled', 'active', 'completed', 'cancelled'];

function defaultEventWindow(): { startsAt: string; endsAt: string } {
  const starts = new Date();
  starts.setHours(0, 0, 0, 0);
  const ends = new Date(starts);
  ends.setDate(ends.getDate() + 7);
  ends.setHours(23, 59, 0, 0);
  return { startsAt: starts.toISOString(), endsAt: ends.toISOString() };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminEventsScheduler() {
  const t = useTranslations('admin.events');
  const { state, refetch, save, saving, saveError } = useAdminEventsScheduler();
  const defaults = useMemo(() => defaultEventWindow(), []);
  const [editId, setEditId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('custom');
  const [startsAt, setStartsAt] = useState(toDatetimeLocalValue(defaults.startsAt));
  const [endsAt, setEndsAt] = useState(toDatetimeLocalValue(defaults.endsAt));
  const [status, setStatus] = useState<EventStatus>('scheduled');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const challenges = state.status === 'ready' ? state.challenges : [];

  const toggleChallenge = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || selectedIds.length === 0) return;
    const finalSlug = slug.trim() || slugify(title);
    await save({
      id: editId,
      slug: finalSlug,
      title: title.trim(),
      description: description.trim(),
      eventType,
      startsAt: fromDatetimeLocalValue(startsAt),
      endsAt: fromDatetimeLocalValue(endsAt),
      status,
      challengeIds: selectedIds,
    });
    setEditId(null);
    setSlug('');
    setTitle('');
    setDescription('');
    setSelectedIds([]);
  };

  const loadRow = (row: (typeof state.rows)[number]) => {
    setEditId(row.id);
    setSlug(row.slug);
    setTitle(row.title);
    setDescription(row.description);
    setEventType(row.event_type);
    setStartsAt(toDatetimeLocalValue(row.starts_at));
    setEndsAt(toDatetimeLocalValue(row.ends_at));
    setStatus(row.status);
    setSelectedIds(
      row.event_challenges
        .map((ec) => ec.challenge_id)
        .sort(
          (a, b) =>
            (row.event_challenges.find((x) => x.challenge_id === a)?.sort_order ?? 0) -
            (row.event_challenges.find((x) => x.challenge_id === b)?.sort_order ?? 0),
        ),
    );
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

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('nameLabel')}
            </span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('slug')}
            </span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t('slugPlaceholder')}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('description')}
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('eventType')}
            </span>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('status')}
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`statuses.${s}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

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

        <fieldset className="space-y-2">
          <legend className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('challenges')} ({selectedIds.length}/5)
          </legend>
          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
            {challenges.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={() => toggleChallenge(c.id)}
                  />
                  {c.is_official ? '★ ' : ''}
                  {c.title}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        {saveError ? <p className="text-xs text-primary">{saveError}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || !title.trim() || selectedIds.length === 0}
            className="rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
          >
            {saving ? t('saving') : editId ? t('update') : t('create')}
          </button>
          {editId ? (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setSelectedIds([]);
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
                  <p className="text-sm font-black uppercase tracking-tight">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    /{row.slug} · {t(`statuses.${row.status}`)} · {row.event_challenges.length}{' '}
                    {t('challengeShort')}
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
