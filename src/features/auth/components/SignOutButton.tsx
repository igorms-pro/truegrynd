'use client';

import { useCallback, useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { signOut } from '@/features/auth/services/auth';

type Props = {
  variant?: 'card' | 'menu' | 'footer';
  onSignedOut?: () => void;
};

export function SignOutButton({ variant = 'card', onSignedOut }: Props): ReactElement {
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
      onSignedOut?.();
      router.push(`/${locale}/auth`);
      router.refresh();
    } catch {
      setError(t('error'));
    } finally {
      setBusy(false);
    }
  }, [locale, onSignedOut, router, t]);

  const onClick = useCallback(() => {
    void handleClick();
  }, [handleClick]);

  const buttonClass =
    variant === 'footer'
      ? 'inline-flex w-full min-h-12 items-center justify-center rounded-md border border-primary bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      : variant === 'menu'
        ? 'inline-flex w-full min-h-11 items-center justify-center rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        : 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  if (variant === 'footer') {
    return (
      <div>
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
          className={buttonClass}
        >
          {busy ? t('submitting') : t('label')}
        </button>
      </div>
    );
  }

  if (variant === 'menu') {
    return (
      <div>
        {error ? (
          <p className="mb-2 px-2 text-xs font-semibold text-primary" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onClick}
          disabled={busy}
          aria-label={t('aria')}
          role="menuitem"
          className={buttonClass}
        >
          {busy ? t('submitting') : t('label')}
        </button>
      </div>
    );
  }

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
        className={buttonClass}
      >
        {busy ? t('submitting') : t('label')}
      </button>
    </div>
  );
}
