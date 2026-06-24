'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { ProNav } from '@/features/pro/components/ProNav';
import { SubscriptionGate } from '@/features/pro/components/SubscriptionGate';
import { canAccessPro } from '@/lib/roles';

export default function ProLayout({ children }: { children: ReactNode }) {
  const profile = useOptionalAppProfile();
  const t = useTranslations('pro');

  if (!canAccessPro(profile)) {
    notFound();
  }

  return (
    <section className="space-y-6 py-4">
      <header className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
          {t('badge')}
        </p>
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <ProNav />

      <SubscriptionGate>{children}</SubscriptionGate>
    </section>
  );
}
