'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'primary' | 'accent' | 'neutral';

const TONE_STYLES: Record<
  Tone,
  { border: string; bar: string; icon: string; title: string; wash: string }
> = {
  primary: {
    border: 'border-primary/40',
    bar: 'bg-primary',
    icon: 'text-primary',
    title: 'text-primary',
    wash: 'bg-[linear-gradient(90deg,rgba(220,38,38,0.1)_0%,transparent_55%)]',
  },
  accent: {
    border: 'border-accent/40',
    bar: 'bg-accent',
    icon: 'text-accent',
    title: 'text-accent',
    wash: 'bg-[linear-gradient(90deg,rgba(255,184,0,0.1)_0%,transparent_55%)]',
  },
  neutral: {
    border: 'border-border',
    bar: 'bg-muted-foreground',
    icon: 'text-muted-foreground',
    title: 'text-muted-foreground',
    wash: '',
  },
};

type Props = {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  withWash?: boolean;
};

export function ChallengeDetailSection({
  tone,
  icon: Icon,
  title,
  children,
  withWash = true,
}: Props) {
  const styles = TONE_STYLES[tone];

  return (
    <article
      className={['relative overflow-hidden rounded-md border bg-card', styles.border].join(' ')}
    >
      {withWash && styles.wash.length > 0 ? (
        <div className={`pointer-events-none absolute inset-0 ${styles.wash}`} aria-hidden />
      ) : null}
      <span className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`} aria-hidden />

      <div className="relative space-y-3 py-4 pl-5 pr-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 shrink-0 ${styles.icon}`} aria-hidden />
          <h2 className={`text-sm font-black uppercase tracking-[0.22em] ${styles.title}`}>
            {title}
          </h2>
        </div>
        {children}
      </div>
    </article>
  );
}
