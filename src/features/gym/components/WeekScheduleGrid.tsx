'use client';

import { Pencil, Trash2, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { ClassType, GymClass } from '@/features/pro/services/planning';

/** Monday-first weekday labels from the locale (no i18n keys needed). */
function weekdayLabels(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 2024-01-01 is a Monday.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2024, 0, 1 + i))));
}

function endTime(start: string, durationMin: number): string {
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + durationMin;
  const eh = Math.floor(total / 60) % 24;
  const em = total % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

/** WOD is the brand — red. The rest stays quieter. */
const TYPE_BADGE: Record<ClassType, string> = {
  wod: 'bg-primary/15 text-primary',
  hyrox: 'bg-sky-500/15 text-sky-400',
  open_gym: 'bg-muted text-muted-foreground',
  weightlifting: 'bg-amber-500/15 text-amber-500',
  gymnastics: 'bg-violet-500/15 text-violet-400',
  endurance: 'bg-emerald-500/15 text-emerald-500',
  other: 'bg-muted text-muted-foreground',
};

/** A slot with more bookings than this is "popular" → red highlight (Igor's rule). */
const POPULAR_THRESHOLD = 10;

/** Booked counts arrive with V4-02 (gym_bookings); until then cards show capacity only. */
export type ScheduleSlot = GymClass & { bookedCount?: number };

type Props = {
  classes: ScheduleSlot[];
  /** Staff-only row actions; omit for the member read-only view. */
  onEdit?: (c: GymClass) => void;
  onDelete?: (c: GymClass) => void;
};

/**
 * Monday→Sunday weekly schedule grid (Peppy DNA, TrueGrynd skin). 7 columns on lg+,
 * stacked day sections below. Shared by /pro/planning (editable) and "Ma salle" (read-only).
 */
export function WeekScheduleGrid({ classes, onEdit, onDelete }: Props) {
  const locale = useLocale();
  const t = useTranslations('gym.schedule');
  const days = weekdayLabels(locale);

  const byDay: ScheduleSlot[][] = Array.from({ length: 7 }, () => []);
  for (const c of classes) byDay[c.weekday]?.push(c);

  const card = (c: ScheduleSlot) => {
    const popular = (c.bookedCount ?? 0) > POPULAR_THRESHOLD;
    return (
      <div
        key={c.id}
        className={`space-y-1.5 rounded-md border p-2.5 ${
          popular ? 'border-primary bg-primary/10' : 'border-border bg-card'
        } ${c.isActive ? '' : 'opacity-50'}`}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-black tabular-nums">
            {c.startTime}
            <span className="text-muted-foreground"> – {endTime(c.startTime, c.durationMin)}</span>
          </p>
          {popular ? (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-primary-foreground">
              {t('popular')}
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm font-bold" title={c.title}>
          {c.title}
        </p>
        <div className="flex items-center justify-between gap-1">
          <span
            className={`rounded-sm px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] ${TYPE_BADGE[c.classType]}`}
          >
            {t(`type.${c.classType}`)}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[10px] tabular-nums ${
              popular ? 'font-black text-primary' : 'text-muted-foreground'
            }`}
          >
            <Users className="h-3 w-3" aria-hidden />
            {c.bookedCount != null ? `${c.bookedCount}/${c.capacity}` : c.capacity}
          </span>
        </div>
        {onEdit || onDelete ? (
          <div className="flex justify-end gap-1 border-t border-border pt-1.5">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(c)}
                aria-label={t('edit')}
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(c)}
                aria-label={t('delete')}
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-2">
      {days.map((label, i) => (
        <div key={label} className="space-y-2">
          <p className="rounded-sm bg-muted/50 px-2 py-1.5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          {byDay[i].length === 0 ? (
            <p className="rounded-md border border-dashed border-border/60 p-2 text-center text-[10px] text-muted-foreground/60">
              —
            </p>
          ) : (
            byDay[i].map(card)
          )}
        </div>
      ))}
    </div>
  );
}
