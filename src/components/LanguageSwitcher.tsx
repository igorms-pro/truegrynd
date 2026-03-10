'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

type Locale = 'en' | 'fr' | 'es' | 'pt' | 'pt-BR' | 'ja' | 'zh' | 'de' | 'it' | 'ru';

type Variant = 'button' | 'dropdown';
type Size = 'sm' | 'md' | 'lg';

const LOCALES: Locale[] = ['en', 'fr', 'es', 'pt', 'pt-BR', 'ja', 'zh', 'de', 'it', 'ru'];

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-10 w-10 text-sm',
};

const FLAG_EMOJIS: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  es: '🇪🇸',
  pt: '🇵🇹',
  'pt-BR': '🇧🇷',
  ja: '🇯🇵',
  zh: '🇨🇳',
  de: '🇩🇪',
  it: '🇮🇹',
  ru: '🇷🇺',
};

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
  pt: 'PT',
  'pt-BR': 'BR',
  ja: 'JP',
  zh: 'CN',
  de: 'DE',
  it: 'IT',
  ru: 'RU',
};

interface LanguageSwitcherProps {
  variant?: Variant;
  size?: Size;
}

export function LanguageSwitcher({ variant = 'dropdown', size = 'md' }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLocale = (next: Locale) => {
    if (next === locale) return;

    const currentPath = pathname ?? '/';
    const segments = currentPath.split('/');
    const currentFirst = segments[1];

    if (LOCALES.includes(currentFirst as Locale)) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }

    const nextPath = segments.join('/') || '/';
    router.push(nextPath);
  };

  const ariaLabel = t('languageSwitcherLabel', { default: 'Change language' }) ?? 'Change language';

  if (variant === 'button') {
    const currentIndex = LOCALES.indexOf(locale);
    const next = LOCALES[(currentIndex + 1) % LOCALES.length];

    return (
      <button
        type="button"
        onClick={() => changeLocale(next)}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-md bg-card hover:bg-muted transition-colors`}
        aria-label={ariaLabel}
      >
        <span className="text-lg" aria-hidden="true">
          {FLAG_EMOJIS[locale]}
        </span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-md bg-card hover:bg-muted transition-colors`}
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        <span className="text-lg" aria-hidden="true">
          {FLAG_EMOJIS[locale]}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-32 rounded-md border border-border bg-card shadow-lg">
          {LOCALES.map((code) => {
            const isActive = code === locale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  changeLocale(code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-xs ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="text-lg" aria-hidden="true">
                  {FLAG_EMOJIS[code]}
                </span>
                <span className="font-medium tracking-wide">{LANGUAGE_LABELS[code]}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
