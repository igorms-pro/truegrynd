'use client';

import { useCallback, useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { signOut } from '@/features/auth/services/auth';

export function SignOutButton(): ReactElement {
  const t = useTranslations('profile.signOut');
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      await signOut();
      router.push(`/${locale}/auth`);
      router.refresh();
    } catch {
      setError(t('error'));
    } finally {
      setBusy(false);
    }
  }, [locale, router, t]);

  const onClick = useCallback(() => {
    void handleClick();
  }, [handleClick]);

  return (
    <div className="rounded-sm border border-border bg-card p-4">
      {error ? (
        <p className="mb-3 text-xs font-semibold text-primary" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label={t('aria')}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {busy ? t('submitting') : t('label')}
      </button>
    </div>
  );
}
