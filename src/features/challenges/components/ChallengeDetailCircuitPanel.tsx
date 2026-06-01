'use client';

import { Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ChallengeDetailSection } from '@/features/challenges/components/ChallengeDetailSection';

type Props = {
  lines: string[];
};

function parseMovementLine(line: string): { index: string; label: string; amount: string } {
  const match = /^(\d+)\.\s*(.+?)\s*[—–-]\s*(.+)$/u.exec(line.trim());
  if (!match) {
    return { index: '', label: line, amount: '' };
  }
  return { index: match[1], label: match[2].trim(), amount: match[3].trim() };
}

export function ChallengeDetailCircuitPanel({ lines }: Props) {
  const t = useTranslations('challenge');

  return (
    <ChallengeDetailSection tone="primary" icon={Layers} title={t('circuitHeading')} withWash>
      <ol className="space-y-2">
        {lines.map((line) => {
          const { index, label, amount } = parseMovementLine(line);
          const key = `${index}-${label}`;
          return (
            <li
              key={key}
              className="flex items-center gap-3 rounded-sm border border-border bg-background/80 px-3 py-3"
            >
              {index ? (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/15 text-sm font-black tabular-nums text-primary">
                  {index}
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black uppercase tracking-tight text-foreground">
                  {label}
                </p>
                {amount ? (
                  <p className="mt-0.5 text-xs font-black uppercase tracking-[0.14em] text-accent">
                    {amount}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </ChallengeDetailSection>
  );
}
