'use client';

import { useTranslations } from 'next-intl';

import { CreatorScoreBadge } from '@/features/profile/components/CreatorScoreBadge';
import { AVATAR_ACCEPT, useAvatarUpload } from '@/features/profile/hooks/useAvatarUpload';
import { initialsFromUsername } from '@/features/profile/lib/initials';
import { getFactionBadgeClasses } from '@/lib/factionStyles';
import type { Profile } from '@/lib/types/database.types';

function HudAvatarPlate({
  avatarUrl,
  username,
  avatarAlt,
  upload,
  changeLabel,
}: {
  avatarUrl: string | null;
  username: string | null;
  avatarAlt: string;
  upload: UploadUi;
  changeLabel: string;
}) {
  return (
    <label
      htmlFor={upload.inputId}
      className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-sm border border-border bg-muted shadow-[0_10px_30px_rgba(0,0,0,0.22)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
      aria-disabled={upload.busy}
      aria-label={changeLabel}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={avatarAlt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl font-black tracking-tight">
          {initialsFromUsername(username)}
        </div>
      )}
      <span
        className="absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/10"
        aria-hidden
      />
      <input
        id={upload.inputId}
        type="file"
        accept={AVATAR_ACCEPT}
        className="sr-only"
        disabled={upload.busy}
        aria-label={changeLabel}
        onChange={(e) => void upload.pickFile(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

type UploadUi = ReturnType<typeof useAvatarUpload>;

type Props = {
  profile: Profile;
  onAvatarUpdated: () => void;
};

export function ProfileHeader({ profile, onAvatarUpdated }: Props) {
  const t = useTranslations('profile.header');
  const ta = useTranslations('profile');
  const upload = useAvatarUpload({
    userId: profile.id,
    onUpdated: onAvatarUpdated,
  });

  const username = profile.username ?? t('unknownUser');
  const faction = profile.faction;
  const badge = faction ? getFactionBadgeClasses(faction) : null;

  return (
    <section className="rounded-sm border border-border bg-card p-4">
      <div className="flex items-start gap-4">
        <HudAvatarPlate
          avatarUrl={profile.avatar_url}
          username={profile.username}
          avatarAlt={t('avatarAlt')}
          upload={upload}
          changeLabel={ta('avatar.change')}
        />

        <div className="min-w-0 flex-1 space-y-3 pt-1">
          <div>
            <p className="truncate text-xl font-black uppercase tracking-tight">{username}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {badge ? (
                <span
                  className={[
                    'inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                    badge.bg,
                    badge.text,
                    badge.border,
                  ].join(' ')}
                >
                  {t(`factions.${faction}`)}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-sm border border-border bg-muted px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  {t('noFaction')}
                </span>
              )}

              <span className="text-xs text-muted-foreground">
                {t('streak', { days: profile.streak_days })}
              </span>
              <CreatorScoreBadge score={profile.creator_score} />
            </div>
          </div>

          {upload.error ? (
            <p className="text-xs font-semibold text-primary" role="alert">
              {upload.error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
