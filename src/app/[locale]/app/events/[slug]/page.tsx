'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { use } from 'react';

import { EventDetailScreen } from '@/features/events';

type Props = {
  params: Promise<{ slug: string }>;
};

export default function EventDetailPage({ params }: Props) {
  const { slug } = use(params);
  const locale = useLocale();
  const t = useTranslations('events');

  return (
    <section className="space-y-4">
      <Link
        href={`/${locale}/app/events`}
        className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        ← {t('backEvents')}
      </Link>
      <EventDetailScreen slug={slug} />
    </section>
  );
}
