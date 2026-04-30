'use client';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

// OneLink-style: minimal header for unauth screens (top-right toggles)
export function HeaderMobileSignIn() {
  return (
    <header className="w-full relative z-50">
      <div className="mx-auto w-full max-w-lg flex items-center justify-end py-2 md:py-6 lg:py-8 px-3 md:px-4">
        <div className="flex items-center gap-1.5 relative z-50">
          <ThemeToggle size="sm" />
          <LanguageSwitcher variant="dropdown" size="sm" />
        </div>
      </div>
    </header>
  );
}
