'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';

import { AuthScreen } from '@/features/auth/components/AuthScreen';
import { ReferralCapture } from '@/features/growth/components/ReferralCapture';

function AuthPageFallback() {
  const t = useTranslations('auth');
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <p className="text-sm text-muted-foreground">{t('loading')}</p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <ReferralCapture />
      <AuthScreen />
    </Suspense>
  );
}
