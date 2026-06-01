'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = {
  locale: string;
  label: string;
};

export function RivalMatchBackLink({ locale, label }: Props) {
  return (
    <Link
      href={`/${locale}/app/rivals`}
      className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
