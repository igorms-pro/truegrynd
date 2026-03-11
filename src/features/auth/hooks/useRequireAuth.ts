'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';

export function useRequireAuth() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace(`/${locale}/auth`);
    }
  }, [initialized, user, router, locale]);

  return { user, initialized };
}
