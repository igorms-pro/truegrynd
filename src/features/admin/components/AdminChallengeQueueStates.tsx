'use client';

import { useTranslations } from 'next-intl';

export function AdminChallengeQueueLoading() {
  const t = useTranslations('admin.queue');
  return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
}

type FetchErrorProps = {
  message: string;
  onRetry: () => void;
};

export function AdminChallengeQueueFetchError({ message, onRetry }: FetchErrorProps) {
  const tErr = useTranslations('admin.errors');

  return (
    <div className="space-y-3 rounded-md border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm font-semibold text-primary">{tErr('loadFailed')}</p>
      <p className="text-xs text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-border bg-background px-3 py-2 text-xs font-black uppercase tracking-[0.14em] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {tErr('retry')}
      </button>
    </div>
  );
}

export function AdminChallengeQueueEmpty() {
  const t = useTranslations('admin.queue');
  return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
}
