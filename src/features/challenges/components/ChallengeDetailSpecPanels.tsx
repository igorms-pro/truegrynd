'use client';

import { Dumbbell, Layers, ScrollText } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ChallengeDetailSection } from '@/features/challenges/components/ChallengeDetailSection';
import { ChallengeVariantBadges } from '@/components/ChallengeVariantBadges';
import type { ParsedChallengeRules } from '@/features/challenges/lib/parseChallengeRules';
import type { Challenge } from '@/lib/types/database.types';

type Props = {
  challenge: Challenge;
  parsed: ParsedChallengeRules;
};

export function ChallengeDetailSpecPanels({ challenge, parsed }: Props) {
  const t = useTranslations('challenge');
  const hasScoring = parsed.scoring.trim().length > 0;
  const hasStandards = parsed.standards.trim().length > 0;
  const hasEquipment = challenge.equipment_tags.length > 0;
  const variants = challenge.variants ?? ['standard'];

  return (
    <div className="space-y-4">
      <ChallengeDetailSection tone="neutral" icon={Layers} title={t('variantsHeading')} withWash>
        <p className="mb-3 text-xs text-muted-foreground">{t('variantsBody')}</p>
        <ChallengeVariantBadges variants={variants} />
      </ChallengeDetailSection>

      <div
        className={
          hasScoring && hasStandards
            ? 'grid gap-4 lg:grid-cols-2'
            : hasScoring
              ? 'grid gap-4 md:grid-cols-2'
              : 'grid gap-4'
        }
      >
        {hasScoring ? (
          <ChallengeDetailSection
            tone="primary"
            icon={ScrollText}
            title={t('scoringHeading')}
            withWash
          >
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {parsed.scoring}
            </p>
          </ChallengeDetailSection>
        ) : null}

        <ChallengeDetailSection
          tone="accent"
          icon={Dumbbell}
          title={t('equipmentHeading')}
          withWash
        >
          {hasEquipment ? (
            <ul className="flex flex-wrap gap-2">
              {challenge.equipment_tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-sm border border-border bg-background px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-black uppercase tracking-[0.12em] text-foreground/80">
              {t('noEquipment')}
            </p>
          )}
        </ChallengeDetailSection>
      </div>

      {hasStandards ? (
        <ChallengeDetailSection
          tone="neutral"
          icon={ScrollText}
          title={t('standardsHeading')}
          withWash={false}
        >
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {parsed.standards}
          </p>
        </ChallengeDetailSection>
      ) : null}
    </div>
  );
}
