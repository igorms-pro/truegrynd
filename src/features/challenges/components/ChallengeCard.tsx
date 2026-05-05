'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import type { Challenge } from '@/lib/types/database.types';

type Props = {
  challenge: Challenge;
};

function ScoreTypeBadge({ scoreType }: { scoreType: Challenge['score_type'] }) {
  const t = useTranslations('arena.scoreType');
  return (
    <span className="inline-flex items-center rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
      {t(scoreType)}
    </span>
  );
}

function OfficialBadge() {
  const t = useTranslations('arena');
  return (
    <span className="inline-flex items-center rounded-sm bg-primary/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
      {t('officialBadge')}
    </span>
  );
}

export function ChallengeCard({ challenge }: Props) {
  const locale = useLocale();
  const href = `/${locale}/app/arena/${challenge.id}`;

  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] bg-transparent transition-colors group-hover:bg-primary"
      />

      <div className="flex items-center gap-2">
        <ScoreTypeBadge scoreType={challenge.score_type} />
        {challenge.is_official ? <OfficialBadge /> : null}
      </div>

      <h3 className="mt-3 text-base font-black uppercase tracking-tight text-foreground">
        {challenge.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{challenge.description}</p>

      {challenge.equipment_tags.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {challenge.equipment_tags.map((tag) => (
            <li
              key={tag}
              className="rounded-sm border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              #{tag}
            </li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}
