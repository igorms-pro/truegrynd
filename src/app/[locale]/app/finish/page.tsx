'use client';

import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

import { FinishPageContent } from '@/features/finisher-card/components/FinishPageContent';

export default function FinishPage() {
  const t = useTranslations('finisher');

  return (
    <Suspense
      fallback={
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      }
    >
      <FinishPageContent />
    </Suspense>
  );
}
