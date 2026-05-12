'use client';

import { useCallback, useId, useState } from 'react';
import { useTranslations } from 'next-intl';

import { uploadAvatar } from '@/features/profile/services/avatarUpload';
import { updateAvatarUrl } from '@/features/profile/services/profile';

export const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp';
export const AVATAR_MAX_BYTES = 3 * 1024 * 1024;

type Options = {
  userId: string;
  onUpdated: () => void;
};

export function useAvatarUpload({ userId, onUpdated }: Options): {
  busy: boolean;
  error: string | null;
  inputId: string;
  pickFile: (file: File | null) => Promise<void>;
  remove: () => Promise<void>;
} {
  const t = useTranslations('profile');
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setError(null);

      if (!AVATAR_ACCEPT.split(',').includes(file.type)) {
        setError(t('avatar.errors.type'));
        return;
      }
      if (file.size > AVATAR_MAX_BYTES) {
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

  const remove = useCallback(async () => {
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

  return { busy, error, inputId, pickFile, remove };
}
