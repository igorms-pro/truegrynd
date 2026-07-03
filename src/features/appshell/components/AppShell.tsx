'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AppHeader } from '@/features/appshell/components/AppHeader';
import { BottomDock } from '@/features/appshell/components/BottomDock';
import { AppProfileProvider } from '@/features/appshell/context/AppProfileContext';
import { useRequireAppAccess } from '@/features/appshell/hooks/useRequireAppAccess';
import { ProShell } from '@/features/pro/components/ProShell';

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
  const pathname = usePathname();

  if (access.status !== 'ready') {
    return <AppShellLoading />;
  }

  // The PRO space is its own workspace: dedicated sidebar shell, no B2C header/dock.
  const isPro = /\/app\/pro(\/|$)/.test(pathname);
  if (isPro) {
    return (
      <AppProfileProvider profile={access.profile}>
        <ProShell>{children}</ProShell>
      </AppProfileProvider>
    );
  }

  return (
    <AppProfileProvider profile={access.profile}>
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="mx-auto w-full max-w-5xl px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-10">
          {children}
        </main>
        <BottomDock />
      </div>
    </AppProfileProvider>
  );
}
