'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';

export function useRequireAuth() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      const nextFromQuery = searchParams.get('next');
      const next = nextFromQuery ?? pathname;
      router.replace(`/${locale}/auth?next=${encodeURIComponent(next)}`);
    }
  }, [initialized, user, router, locale, pathname, searchParams]);

  return { user, initialized };
}
