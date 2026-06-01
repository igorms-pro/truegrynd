'use client';

import { useTranslations } from 'next-intl';

import type {
  AdminQueueTabStatus,
  AdminUgcQueueCounts,
} from '@/features/admin/services/adminChallenges';

const STATUS_TABS: AdminQueueTabStatus[] = ['pending', 'arena_live', 'arena_done', 'rejected'];

type Props = {
  active: AdminQueueTabStatus;
  counts: AdminUgcQueueCounts | null;
  onChange: (value: AdminQueueTabStatus) => void;
  disabled: boolean;
};

function formatCount(counts: AdminUgcQueueCounts | null, status: AdminQueueTabStatus): string {
  if (counts === null) return '—';
  return String(counts[status]);
}

export function AdminQueueStatusTabs({ active, counts, onChange, disabled }: Props) {
  const t = useTranslations('admin.queue');
  const total =
    counts === null
      ? null
      : counts.pending + counts.arena_live + counts.arena_done + counts.rejected;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('statusTabsLabel')}>
        {STATUS_TABS.map((status) => {
          const isActive = active === status;
          const countLabel = formatCount(counts, status);
          const tabLabel = t(`statusTab.${status}`);
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={t('statusTabAria', { label: tabLabel, count: countLabel })}
              disabled={disabled}
              onClick={() => onChange(status)}
              className={[
                'inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition-colors',
                isActive
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <span>{tabLabel}</span>
              <span
                className={[
                  'min-w-[1.25rem] rounded-sm px-1 py-0.5 text-center font-mono text-[10px] tabular-nums',
                  isActive ? 'bg-primary/25 text-primary' : 'bg-muted text-foreground',
                ].join(' ')}
                aria-hidden
              >
                {countLabel}
              </span>
            </button>
          );
        })}
      </div>
      {total !== null ? (
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
          {t('ugcTotal', { count: total })}
        </p>
      ) : null}
    </div>
  );
}
