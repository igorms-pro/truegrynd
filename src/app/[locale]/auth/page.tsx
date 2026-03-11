/* eslint-disable @next/next/no-html-link-for-pages */

'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/features/auth/AuthProvider';
import { signInWithMagicLink, signInWithOAuth } from '@/features/auth/services/auth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthPage() {
  const t = useTranslations('auth');
  const { user, initialized } = useAuth();

  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => isValidEmail(email) && !emailLoading && !oauthLoading,
    [email, emailLoading, oauthLoading],
  );

  const handleMagicLink = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError(t('errors.invalidEmail'));
      return;
    }

    setEmailLoading(true);
    try {
      await signInWithMagicLink(email);
      setSentTo(email);
    } catch {
      setError(t('errors.magicLinkFailed'));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    setOauthLoading(provider);
    try {
      await signInWithOAuth(provider);
    } catch {
      setError(t('errors.oauthFailed'));
      setOauthLoading(null);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-muted-foreground">{t('alreadySignedIn')}</p>
        <a className="text-primary font-semibold" href="/">
          {t('goHome')}
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4">
      <header className="fixed top-0 right-0 flex items-center gap-2 p-4">
        <LanguageSwitcher variant="dropdown" />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 pt-24 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        {sentTo ? (
          <div className="w-full rounded-lg border border-border bg-card p-4 text-left">
            <p className="font-semibold">{t('magicLinkSentTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('magicLinkSentBody', { email: sentTo })}
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm font-semibold hover:opacity-90"
              onClick={() => {
                setSentTo(null);
                setEmail('');
              }}
            >
              {t('useDifferentEmail')}
            </button>
          </div>
        ) : (
          <div className="w-full rounded-lg border border-border bg-card p-4 text-left">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground">
              {t('emailLabel')}
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              inputMode="email"
              autoComplete="email"
            />

            {error ? <p className="mt-2 text-sm text-primary">{error}</p> : null}

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={!canSubmit}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {emailLoading ? t('sending') : t('sendMagicLink')}
            </button>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{t('or')}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading || emailLoading}
              className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {oauthLoading === 'google' ? t('connecting') : t('continueWithGoogle')}
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              disabled={!!oauthLoading || emailLoading}
              className="mt-2 w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {oauthLoading === 'apple' ? t('connecting') : t('continueWithApple')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
