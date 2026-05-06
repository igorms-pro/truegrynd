'use client';

import { useCallback, useId, useState } from 'react';
import { useTranslations } from 'next-intl';

import { uploadAvatar } from '@/features/profile/services/avatarUpload';
import { updateAvatarUrl } from '@/features/profile/services/profile';
import { initialsFromUsername } from '@/features/profile/lib/initials';

type Props = {
  userId: string;
  avatarUrl: string | null;
  username: string | null;
  onUpdated: () => void;
};

const ACCEPT = 'image/png,image/jpeg,image/webp';
const MAX_BYTES = 3 * 1024 * 1024;

export function AvatarUploader({ userId, avatarUrl, username, onUpdated }: Props) {
  const t = useTranslations('profile');
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPickFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setError(null);

      if (!ACCEPT.split(',').includes(file.type)) {
        setError(t('avatar.errors.type'));
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(t('avatar.errors.size'));
        return;
      }

      setBusy(true);
      try {
        const publicUrl = await uploadAvatar({ userId, file });
        await updateAvatarUrl({ userId, avatarUrl: publicUrl });
        onUpdated();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        setError(`${t('avatar.errors.upload')} (${message})`);
      } finally {
        setBusy(false);
      }
    },
    [onUpdated, t, userId],
  );

  const onRemove = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await updateAvatarUrl({ userId, avatarUrl: null });
      onUpdated();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setError(`${t('avatar.errors.remove')} (${message})`);
    } finally {
      setBusy(false);
    }
  }, [onUpdated, t, userId]);

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-sm border border-border bg-muted">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={t('avatar.alt')} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-black tracking-tight">
              {initialsFromUsername(username)}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('avatar.title')}
          </p>
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 aria-disabled:opacity-50"
              aria-disabled={busy}
            >
              {busy ? t('avatar.uploading') : t('avatar.change')}
            </label>
            <input
              id={inputId}
              type="file"
              accept={ACCEPT}
              className="hidden"
              disabled={busy}
              onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
            />

            <button
              type="button"
              onClick={() => void onRemove()}
              disabled={busy || !avatarUrl}
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted disabled:opacity-50"
            >
              {t('avatar.remove')}
            </button>
          </div>

          {error ? <p className="text-xs font-semibold text-primary">{error}</p> : null}
          <p className="text-xs text-muted-foreground">{t('avatar.hint')}</p>
        </div>
      </div>
    </div>
  );
}
