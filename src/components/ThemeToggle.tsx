'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

type Size = 'sm' | 'md' | 'lg';

const buttonSize: Record<Size, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

const iconSize: Record<Size, number> = {
  sm: 18,
  md: 20,
  lg: 22,
};

export function ThemeToggle({ size = 'md' }: { size?: Size }) {
  // Avoid hydration mismatches without setState-in-effect lint violations.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return <div className={buttonSize[size]} />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`${buttonSize[size]} flex items-center justify-center rounded-md hover:bg-card transition-colors`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={iconSize[size]} /> : <Moon size={iconSize[size]} />}
    </button>
  );
}
