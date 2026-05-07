'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { signInWithMagicLink, signInWithOAuth } from '@/features/auth/services/auth';
import { HeaderMobileSignIn } from '@/components/HeaderMobileSignIn';
import { isDebugEnabled } from '@/lib/debug';
import { DevSessionReset } from '@/features/auth/components/DevSessionReset';
import { AuthDebugPanel } from '@/features/auth/components/AuthDebugPanel';
import { useAuthPostRedirect } from '@/features/auth/hooks/useAuthPostRedirect';
import { useEmailCooldown } from '@/features/auth/hooks/useEmailCooldown';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthPage() {
  const t = useTranslations('auth');
  const { user, initialized, lastEvent } = useAuth();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { cooldownSeconds, startCooldown, canSend } = useEmailCooldown();

  useEffect(() => {
    setMounted(true);
  }, []);

  const debugEnabled = useMemo(() => (mounted ? isDebugEnabled() : false), [mounted]);

  const debugInfo = useMemo(() => {
    if (!debugEnabled || typeof window === 'undefined') return null;
    const url = new URL(window.location.href);
    return {
      href: window.location.href,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      hasCode: !!url.searchParams.get('code'),
    };
  }, [debugEnabled]);

  const canSubmit = useMemo(() => {
    return isValidEmail(email) && !emailLoading && !oauthLoading && canSend;
  }, [email, emailLoading, oauthLoading, canSend]);

  const handleMagicLink = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError(t('errors.invalidEmail'));
      return;
    }

    setEmailLoading(true);
    try {
      await signInWithMagicLink(email, `${window.location.origin}/${locale}/auth`);
      setSentTo(email);
      startCooldown(60);
    } catch (err: unknown) {
      const status =
        typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number'
          ? err.status
          : null;
      setError(status === 429 ? t('errors.magicLinkRateLimited') : t('errors.magicLinkFailed'));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    setOauthLoading(provider);
    try {
      await signInWithOAuth(provider, `${window.location.origin}/${locale}/auth`);
    } catch {
      setError(t('errors.oauthFailed'));
      setOauthLoading(null);
    }
  };

  const postAuth = useAuthPostRedirect({ user, initialized, locale, t });

  if (!initialized || postAuth.redirecting) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-full max-w-lg px-4">
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
          {debugInfo ? (
            <AuthDebugPanel
              data={{
                initialized,
                hasUser: !!user,
                userId: user?.id ?? null,
                lastEvent,
                redirecting: postAuth.redirecting,
                postAuthStep: postAuth.step,
                error: postAuth.error ?? error,
                url: debugInfo,
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }

  // When user is present, redirect effect above will take over.

  return (
    <div className="min-h-screen bg-background text-foreground px-4">
      <HeaderMobileSignIn />

      <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 pt-24 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          {searchParams.get('reason') === 'session_expired' ? (
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
              {t('sessionExpired')}
            </p>
          ) : searchParams.get('next') ? (
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
              {t('signInToContinue')}
            </p>
          ) : null}
        </div>

        {debugEnabled ? <DevSessionReset /> : null}

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

            {error || postAuth.error ? (
              <p className="mt-2 text-sm text-primary">{postAuth.error ?? error}</p>
            ) : null}
            {debugInfo ? (
              <AuthDebugPanel
                data={{
                  initialized,
                  hasUser: !!user,
                  userId: user?.id ?? null,
                  lastEvent,
                  redirecting: postAuth.redirecting,
                  postAuthStep: postAuth.step,
                  error: postAuth.error ?? error,
                  url: debugInfo,
                }}
              />
            ) : null}

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={!canSubmit}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {emailLoading
                ? t('sending')
                : cooldownSeconds > 0
                  ? `${t('sendMagicLink')} (${cooldownSeconds}s)`
                  : t('sendMagicLink')}
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
