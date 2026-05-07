'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DesktopNav } from '@/features/appshell/components/DesktopNav';

export function AppHeader() {
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div
        className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 pt-[env(safe-area-inset-top)]"
        style={{ minHeight: 'calc(3.5rem + env(safe-area-inset-top))' }}
      >
        <Link
          href={`/${locale}/app/overview`}
          className="text-sm font-black uppercase tracking-[0.18em] text-foreground"
        >
          TRUEGRYND
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-1.5">
          <ThemeToggle size="sm" />
          <LanguageSwitcher variant="dropdown" size="sm" />
        </div>
      </div>
    </header>
  );
}
