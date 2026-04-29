'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { completeInitiation } from '@/features/onboarding/services/onboarding';

type Props = {
  userId: string;
  onCompleted: () => Promise<void> | void;
};

const STORAGE_VERSION = 1;

type DoneState = [boolean, boolean, boolean];

export function OnboardingInitiationStep({ userId, onCompleted }: Props) {
  const t = useTranslations('onboarding');
  const storageKey = useMemo(
    () => `truegrynd:onboarding:init:v${STORAGE_VERSION}:${userId}`,
    [userId],
  );

  const [done, setDone] = useState<DoneState>([false, false, false]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DoneState;
      if (!Array.isArray(parsed) || parsed.length !== 3) return;
      setDone([parsed[0] === true, parsed[1] === true, parsed[2] === true]);
    } catch {
      // ignore storage failures
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(done));
    } catch {
      // ignore storage failures
    }
  }, [done, storageKey]);

  const doneCount = done.filter(Boolean).length;

  useEffect(() => {
    if (saving) return;
    if (completedRef.current) return;
    if (!done.every(Boolean)) return;

    completedRef.current = true;
    void (async () => {
      setSaving(true);
      setError(null);
      try {
        await completeInitiation(userId);
        try {
          window.localStorage.removeItem(storageKey);
        } catch {
          // ignore storage failures
        }
        await onCompleted();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        setError(`${t('errors.completeInitiationFailed')} (${message})`);
        completedRef.current = false;
      } finally {
        setSaving(false);
      }
    })();
  }, [done, onCompleted, saving, storageKey, t, userId]);

  const handleDone = async (index: number) => {
    if (saving) return;
    if (done[index]) return;
    setError(null);

    const next: DoneState = [done[0], done[1], done[2]];
    next[index] = true;
    setDone(next);
  };

  return (
    <section>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">
          {t('initiation.copy')}
        </p>
        <h2 className="mt-2 text-xl font-black tracking-tight">{t('initiation.heading')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('initiation.tracker', { done: doneCount, total: 3 })}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {[0, 1, 2].map((i) => {
          const isDone = done[i];
          const cardTitle =
            i === 0
              ? t('initiation.challenge1.title')
              : i === 1
                ? t('initiation.challenge2.title')
                : t('initiation.challenge3.title');
          return (
            <div key={i} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black tracking-tight">{cardTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('initiation.challengeHint')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDone(i)}
                  disabled={saving || isDone}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-black transition-opacity ${
                    isDone ? 'bg-primary/10 text-primary' : 'bg-primary text-white hover:opacity-90'
                  } disabled:opacity-50`}
                  aria-label={isDone ? t('initiation.doneAlready') : t('initiation.doneButton')}
                >
                  {isDone ? t('initiation.doneAlready') : t('initiation.doneButton')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4">
          <p className="text-sm font-semibold text-primary">{error}</p>
        </div>
      ) : null}
    </section>
  );
}
