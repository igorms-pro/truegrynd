'use client';

import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [mounted] = useState(() => typeof window !== 'undefined');
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
