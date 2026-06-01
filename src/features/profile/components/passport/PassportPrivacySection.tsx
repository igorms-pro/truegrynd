'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  PASSPORT_PRIVACY_KEYS,
  parsePassportPrivacy,
  type PassportPrivacyKey,
  type PassportPrivacySettings,
} from '@/features/profile/lib/passportPrivacy';
import { updatePassportPrivacy } from '@/features/profile/services/passportPrivacy';
import type { Profile } from '@/lib/types/database.types';

type Props = {
  profile: Profile;
  onSaved: () => void;
};

const PRIVACY_LABEL_KEYS: Record<PassportPrivacyKey, string> = {
  showDivisionOnPublic: 'division',
  showRatingOnPublic: 'rating',
  showScoreHistoryOnPublic: 'scoreHistory',
  showTopScoresOnPublic: 'topScores',
  showBadgesOnPublic: 'badges',
  showWeekliesOnPublic: 'weeklies',
  showFinishersOnPublic: 'finishers',
  showRivalWinsOnPublic: 'rivalWins',
};

export function PassportPrivacySection({ profile, onSaved }: Props) {
  const t = useTranslations('profile.passport.privacy');
  const [settings, setSettings] = useState<PassportPrivacySettings>(() =>
    parsePassportPrivacy(profile),
  );
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onToggle = useCallback((key: PassportPrivacyKey, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: checked }));
    setSaved(false);
  }, []);

  const onSave = async () => {
    setSaving(true);
    setSubmitError(null);
    setSaved(false);
    try {
      await updatePassportPrivacy({ userId: profile.id, settings });
      setSaved(true);
      onSaved();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setSubmitError(t('saveError', { message }));
    } finally {
      setSaving(false);
    }
  };

  const baseline = parsePassportPrivacy(profile);
  const isDirty = PASSPORT_PRIVACY_KEYS.some((key) => settings[key] !== baseline[key]);

  return (
    <section
      className="rounded-sm border border-border bg-card p-4 space-y-4"
      aria-labelledby="passport-privacy-title"
    >
      <header className="space-y-1">
        <h2
          id="passport-privacy-title"
          className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
        >
          {t('title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('body')}</p>
      </header>

      <ul className="space-y-3">
        {PASSPORT_PRIVACY_KEYS.map((key) => (
          <li key={key}>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => onToggle(key, e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border bg-background accent-primary"
              />
              <span className="text-xs text-muted-foreground">
                {t(`sections.${PRIVACY_LABEL_KEYS[key]}`)}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {submitError ? (
        <p className="text-xs font-semibold text-primary" role="alert">
          {submitError}
        </p>
      ) : null}
      {saved ? (
        <p className="text-xs font-semibold text-accent" role="status">
          {t('saved')}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void onSave()}
        disabled={!isDirty || saving}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-muted/30 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] hover:bg-muted/50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {saving ? t('saving') : t('save')}
      </button>
    </section>
  );
}
