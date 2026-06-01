'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import { downloadBlob, exportUserData } from '@/features/settings/lib/exportUserData';

type Props = {
  userId: string;
};

export function DataManagementSection({ userId }: Props) {
  const t = useTranslations('settings.data');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  const onExport = useCallback(async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportUserData(userId);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `truegrynd-export-${stamp}.json`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setExportError(t('exportError', { message }));
    } finally {
      setExporting(false);
    }
  }, [t, userId]);

  const onDeleteClick = useCallback(() => {
    setDeleteOpen(true);
    setDeleteNotice(null);
  }, []);

  const onDeleteCancel = useCallback(() => setDeleteOpen(false), []);

  const onDeleteConfirm = useCallback(() => {
    setDeleteOpen(false);
    setDeleteNotice(t('deletePending'));
  }, [t]);

  return (
    <section className="rounded-md border border-border bg-card p-4 space-y-3">
      <header className="space-y-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t('kicker')}</p>
        <h2 className="text-lg font-black uppercase tracking-tight">{t('title')}</h2>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => void onExport()}
          disabled={exporting}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {exporting ? t('exporting') : t('export')}
        </button>
        <button
          type="button"
          onClick={onDeleteClick}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('delete')}
        </button>
      </div>

      {exportError ? (
        <p className="text-xs font-semibold text-primary" role="alert">
          {exportError}
        </p>
      ) : null}
      {deleteNotice ? (
        <p className="text-xs text-muted-foreground" role="status">
          {deleteNotice}
        </p>
      ) : null}

      {deleteOpen ? (
        <div
          className="rounded-md border border-primary/40 bg-background p-3 space-y-3"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <p id="delete-account-title" className="text-sm font-black uppercase tracking-tight">
            {t('deleteConfirmTitle')}
          </p>
          <p className="text-sm text-muted-foreground">{t('deleteConfirmBody')}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onDeleteCancel}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('deleteCancel')}
            </button>
            <button
              type="button"
              onClick={onDeleteConfirm}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('deleteConfirm')}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
