'use client';

import { CalendarDays, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { WeekScheduleGrid } from '@/features/gym/components/WeekScheduleGrid';
import { listGymClasses } from '@/features/pro/services/planning';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { supabase } from '@/lib/supabase';

type GymHeader = { name: string; slug: string };

async function getGymHeader(gymId: string): Promise<GymHeader> {
  const { data, error } = await supabase
    .from('gyms')
    .select('name, slug')
    .eq('id', gymId)
    .maybeSingle<GymHeader>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('gym_not_found');
  return data;
}

/** Member view of their own gym: weekly schedule (read-only). Booking arrives with V4-02. */
export function MyGymScreen() {
  const t = useTranslations('myGym');
  const locale = useLocale();
  const profile = useOptionalAppProfile();
  const gymId = profile?.affiliated_gym_id ?? null;

  const load = useCallback(async () => {
    const [gym, classes] = await Promise.all([
      getGymHeader(gymId ?? ''),
      listGymClasses(gymId ?? ''),
    ]);
    return { gym, classes: classes.filter((c) => c.isActive) };
  }, [gymId]);
  const { state } = useAsyncResource(load, [gymId ?? ''], { enabled: gymId !== null });

  if (!gymId) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          {t('noGym')}
        </p>
      </section>
    );
  }
  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }

  const { gym, classes } = state.data;

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
          {t('kicker')}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{gym.name}</h1>
          <Link
            href={`/${locale}/app/gym/${gym.slug}`}
            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            {t('publicPage')}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="space-y-3">
        <h2 className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          <CalendarDays className="h-4 w-4" aria-hidden />
          {t('scheduleTitle')}
        </h2>
        {classes.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            {t('scheduleEmpty')}
          </p>
        ) : (
          <WeekScheduleGrid classes={classes} />
        )}
        <p className="text-xs text-muted-foreground">{t('bookingSoon')}</p>
      </div>
    </section>
  );
}
