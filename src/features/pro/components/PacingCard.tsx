'use client';

import { Gauge } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import { FORM_INPUT_CLASS } from '@/features/pro/lib/formStyles';
import { getEventPacing, setEventPacing } from '@/features/pro/services/events';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { formatTime } from '@/lib/scoring';

/** "12:30" / "90" → seconds (null if unparseable). */
function parseMmSs(raw: string): number | null {
  const v = raw.trim();
  if (/^\d+$/.test(v)) return parseInt(v, 10);
  const m = v.match(/^(\d+):([0-5]?\d)$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function SetPacingForm({
  eventId,
  onSaved,
  initial,
}: {
  eventId: string;
  onSaved: () => void;
  initial: { benchmark: string; segments: number } | null;
}) {
  const t = useTranslations('pro.events.pacing');
  const [benchmark, setBenchmark] = useState(initial?.benchmark ?? '');
  const [segments, setSegments] = useState(String(initial?.segments ?? 3));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const secs = parseMmSs(benchmark);
    const seg = parseInt(segments, 10);
    if (!secs || secs <= 0 || !seg || seg < 1) {
      setError(t('invalid'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await setEventPacing({ eventId, benchmarkSeconds: secs, segments: seg });
      onSaved();
    } catch {
      setError(t('error'));
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('benchmark')}
        <input
          value={benchmark}
          onChange={(e) => setBenchmark(e.target.value)}
          placeholder="12:00"
          className={FORM_INPUT_CLASS}
        />
      </label>
      <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('segments')}
        <input
          type="number"
          min={1}
          max={20}
          value={segments}
          onChange={(e) => setSegments(e.target.value)}
          className={FORM_INPUT_CLASS}
        />
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={save}
        className="rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {busy ? t('saving') : t('save')}
      </button>
      {error ? <p className="text-xs font-semibold text-primary sm:col-span-3">{error}</p> : null}
    </div>
  );
}

export function PacingCard({ eventId, canManage }: { eventId: string; canManage: boolean }) {
  const t = useTranslations('pro.events.pacing');
  const load = useCallback(() => getEventPacing(eventId), [eventId]);
  const { state, refetch } = useAsyncResource(load, [eventId]);
  const [editing, setEditing] = useState(false);

  if (state.status !== 'ready') return null;
  const pacing = state.data;

  // No plan: only staff sees the "set it up" affordance.
  if (!pacing && !canManage) return null;

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
          <Gauge className="h-3.5 w-3.5" />
          {t('title')}
        </p>
        {canManage && pacing && !editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-sm border border-border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            {t('edit')}
          </button>
        ) : null}
      </div>

      {pacing && !editing ? (
        <div className="mt-3 space-y-1">
          <p className="text-sm">
            {t('yourTarget')}{' '}
            <span className="text-2xl font-black tabular-nums">
              {formatTime(pacing.personalTargetSeconds)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {t('splits', { time: formatTime(pacing.splitSeconds), count: pacing.segments })}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t('basis', { engine: pacing.engine, benchmark: formatTime(pacing.benchmarkSeconds) })}
          </p>
        </div>
      ) : null}

      {!pacing && canManage && !editing ? (
        <p className="mt-2 text-sm text-muted-foreground">{t('emptyStaff')}</p>
      ) : null}

      {canManage && (editing || !pacing) ? (
        <SetPacingForm
          eventId={eventId}
          initial={
            pacing
              ? { benchmark: formatTime(pacing.benchmarkSeconds), segments: pacing.segments }
              : null
          }
          onSaved={() => {
            setEditing(false);
            refetch();
          }}
        />
      ) : null}
    </div>
  );
}
