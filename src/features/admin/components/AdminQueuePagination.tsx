'use client';

import { useTranslations } from 'next-intl';

type Props = {
  page: number;
  totalPages: number;
  totalCount: number;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function AdminQueuePagination({
  page,
  totalPages,
  totalCount,
  disabled,
  onPrev,
  onNext,
}: Props) {
  const t = useTranslations('admin.queue');

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
        {t('paginationSummary', { page, totalPages, totalCount })}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={disabled || page <= 1}
          className="rounded-md border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] hover:bg-muted disabled:opacity-50"
        >
          {t('paginationPrev')}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={disabled || page >= totalPages}
          className="rounded-md border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] hover:bg-muted disabled:opacity-50"
        >
          {t('paginationNext')}
        </button>
      </div>
    </div>
  );
}
