'use client';

import { HeaderMobileSignIn } from '@/components/HeaderMobileSignIn';

type Props = {
  title: string;
  children: React.ReactNode;
};

export function OnboardingShell({ title, children }: Props) {
  return (
    <>
      <HeaderMobileSignIn />
      <main className="min-h-screen bg-background text-foreground px-4 pt-6 pb-6 md:pt-24 md:pb-10">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h1>
          {children}
        </div>
      </main>
    </>
  );
}
