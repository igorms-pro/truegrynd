'use client';

import Link from 'next/link';

import { AdminProofQueue } from '@/features/admin/components/AdminProofQueue';

type Props = {
  locale: string;
};

export function AdminProofPageShell({ locale }: Props) {
  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-3 text-[11px] font-black uppercase tracking-[0.18em]">
        <Link
          href={`/${locale}/app/admin/challenges`}
          className="text-muted-foreground hover:text-foreground"
        >
          UGC
        </Link>
        <Link
          href={`/${locale}/app/admin/weekly`}
          className="text-muted-foreground hover:text-foreground"
        >
          Weekly
        </Link>
        <Link
          href={`/${locale}/app/admin/events`}
          className="text-muted-foreground hover:text-foreground"
        >
          Events
        </Link>
        <span className="text-primary">Proof</span>
      </nav>
      <AdminProofQueue />
    </div>
  );
}
