'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { isPlatformAdmin } from '@/lib/roles';

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const profile = useOptionalAppProfile();

  if (!isPlatformAdmin(profile)) {
    notFound();
  }

  return <div className="space-y-6 py-4">{children}</div>;
}
