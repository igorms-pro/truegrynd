'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  // Avoid hydration mismatches without setState-in-effect lint violations.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-card transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
