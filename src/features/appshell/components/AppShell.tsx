'use client';

import { useTranslations } from 'next-intl';

import { AppHeader } from '@/features/appshell/components/AppHeader';
import { BottomDock } from '@/features/appshell/components/BottomDock';
import { useRequireAppAccess } from '@/features/appshell/hooks/useRequireAppAccess';

type Props = {
  children: React.ReactNode;
};

function AppShellLoading() {
  const t = useTranslations('app');
  return (
    <main
      role="status"
      aria-live="polite"
      className="min-h-screen bg-background text-foreground px-4 pt-24"
    >
      <p className="text-sm text-muted-foreground">{t('loading')}</p>
    </main>
  );
}

export function AppShell({ children }: Props) {
  const access = useRequireAppAccess();

  if (access.status !== 'ready') {
    return <AppShellLoading />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-10">
        {children}
      </main>
      <BottomDock />
    </div>
  );
}
