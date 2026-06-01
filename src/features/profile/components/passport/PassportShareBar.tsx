'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  /** Locale-prefixed public profile path, e.g. /en/app/u/name */
  publicPath: string | null;
};

export function PassportShareBar({ publicPath }: Props) {
  const t = useTranslations('profile.passport.share');
  const [copied, setCopied] = useState(false);
  const displayUrl =
    publicPath && typeof window !== 'undefined'
      ? `${window.location.origin}${publicPath}`
      : publicPath;

  const onCopy = useCallback(async () => {
    if (!publicPath) return;
    const full =
      typeof window !== 'undefined' ? `${window.location.origin}${publicPath}` : publicPath;
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [publicPath]);

  if (!publicPath) {
    return (
      <section className="rounded-sm border border-dashed border-border bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">{t('noUsername')}</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-sm border border-border bg-card p-4 space-y-3"
      aria-labelledby="passport-share-title"
    >
      <div>
        <h2
          id="passport-share-title"
          className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
        >
          {t('title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('body')}</p>
      </div>
      <p className="break-all font-mono text-xs text-muted-foreground">{displayUrl}</p>
      <button
        type="button"
        onClick={() => void onCopy()}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? t('copied') : t('copy')}
      </button>
    </section>
  );
}
