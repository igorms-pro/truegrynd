'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { formatScore } from '@/lib/scoring';
import { useMyScores } from '@/features/profile/hooks/useMyScores';

type Props = {
  userId: string;
};

function Badge({ children, tone }: { children: string; tone: 'ranked' | 'saved' }) {
  const className =
    tone === 'ranked'
      ? 'border-primary bg-primary/10 text-primary'
      : 'border-border bg-muted text-muted-foreground';
  return (
    <span
      className={[
        'inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

export function ScoreHistory({ userId }: Props) {
  const t = useTranslations('profile.history');
  const locale = useLocale();
  const { state, refetch } = useMyScores(userId);

  if (state.status === 'loading') {
    return (
      <section className="rounded-md border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('title')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="rounded-md border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('title')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t('error')}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90"
        >
          {t('retry')}
        </button>
      </section>
    );
  }

  if (state.data.length === 0) {
    return (
      <section className="rounded-md border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('title')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t('empty')}</p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-border bg-card p-4 space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('title')}
      </p>

      <div className="space-y-2">
        {state.data.map((s) => {
          const score = formatScore(s.value, s.scoreType);
          const badge = s.isValidated ? t('ranked') : t('saved');
          const tone = s.isValidated ? 'ranked' : 'saved';
          const toChallenge = `/${locale}/app/arena/${s.challengeId}`;
          const toFinisher = `/${locale}/app/finish?challengeId=${s.challengeId}&ranked=${String(
            s.isValidated,
          )}&scoreId=${encodeURIComponent(s.id)}`;

          return (
            <div key={s.id} className="rounded-sm border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase tracking-tight">
                    {s.challengeTitle}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {score} · {new Date(s.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge tone={tone}>{badge}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={toChallenge}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-muted px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-foreground hover:bg-background"
                >
                  {t('viewChallenge')}
                </Link>
                <Link
                  href={toFinisher}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90"
                >
                  {t('viewCard')}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
