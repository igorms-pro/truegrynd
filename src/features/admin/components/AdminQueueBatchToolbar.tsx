'use client';

import { useTranslations } from 'next-intl';

type Props = {
  batchBusy: boolean;
  rowBusy: boolean;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchApprove: () => void;
};

export function AdminQueueBatchToolbar({
  batchBusy,
  rowBusy,
  selectedCount,
  onSelectAll,
  onClearSelection,
  onBatchApprove,
}: Props) {
  const t = useTranslations('admin.queue');
  const disabled = batchBusy || rowBusy;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onSelectAll}
        disabled={disabled}
        className="rounded-md border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] hover:bg-muted disabled:opacity-50"
      >
        {t('selectAll')}
      </button>
      <button
        type="button"
        onClick={onClearSelection}
        disabled={disabled}
        className="rounded-md border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] hover:bg-muted disabled:opacity-50"
      >
        {t('clearSelection')}
      </button>
      <button
        type="button"
        onClick={onBatchApprove}
        disabled={disabled || selectedCount === 0}
        className="rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {batchBusy ? t('batchApproving') : t('approveSelected', { count: selectedCount })}
      </button>
    </div>
  );
}
