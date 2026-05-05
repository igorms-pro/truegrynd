'use client';

import { useTranslations } from 'next-intl';

export default function ClanPage() {
  const tabs = useTranslations('app.tabs');
  const cs = useTranslations('app.comingSoon');

  return (
    <section className="space-y-3">
      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{tabs('clan')}</h1>
      <div className="rounded-md border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{cs('title')}</p>
        <p className="mt-2 text-sm text-muted-foreground">{cs('body')}</p>
      </div>
    </section>
  );
}
