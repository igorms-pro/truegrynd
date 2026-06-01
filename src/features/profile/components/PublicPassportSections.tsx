'use client';

import { FinisherGallery } from '@/features/finisher-card';
import { PassportBadgesSection } from '@/features/profile/components/passport/PassportBadgesSection';
import { PassportDivisionSection } from '@/features/profile/components/passport/PassportDivisionSection';
import { PassportRivalsSection } from '@/features/profile/components/passport/PassportRivalsSection';
import { PassportTopScoresSection } from '@/features/profile/components/passport/PassportTopScoresSection';
import { PassportWeeklySection } from '@/features/profile/components/passport/PassportWeeklySection';
import { ProfileRatingCard } from '@/features/profile/components/ProfileRatingCard';
import { ScoreHistory } from '@/features/profile/components/ScoreHistory';
import { usePassportData } from '@/features/profile/hooks/usePassportData';
import { useProfileRating } from '@/features/profile/hooks/useProfileRating';
import { parsePassportPrivacy } from '@/features/profile/lib/passportPrivacy';
import type { Profile } from '@/lib/types/database.types';

type Props = {
  profile: Profile;
};

export function PublicPassportSections({ profile }: Props) {
  const privacy = parsePassportPrivacy(profile);
  const passportState = usePassportData(profile.id, profile.division);
  const ratingState = useProfileRating(profile.id);

  const dataLoading = passportState.state.status === 'loading';
  const passportData = passportState.state.status === 'ready' ? passportState.state.data : null;
  const dataError = passportState.state.status === 'error' ? passportState.state.error : null;

  return (
    <>
      {privacy.showDivisionOnPublic ? (
        <PassportDivisionSection
          currentDivision={profile.division}
          divisions={passportData?.divisions ?? [profile.division]}
          history={passportData?.history ?? []}
          loading={dataLoading}
        />
      ) : null}

      {privacy.showRatingOnPublic ? (
        <ProfileRatingCard
          rating={ratingState.state.status === 'ready' ? ratingState.state.rating : null}
          loading={ratingState.state.status === 'loading'}
          error={ratingState.state.status === 'error' ? ratingState.state.error : null}
          onRetry={ratingState.refetch}
        />
      ) : null}

      {privacy.showScoreHistoryOnPublic ? <ScoreHistory userId={profile.id} /> : null}

      {privacy.showTopScoresOnPublic ? (
        <PassportTopScoresSection
          scores={passportData?.topScores ?? []}
          loading={dataLoading}
          error={dataError}
          onRetry={passportState.refetch}
        />
      ) : null}

      {privacy.showBadgesOnPublic ? <PassportBadgesSection profile={profile} /> : null}

      {privacy.showWeekliesOnPublic ? (
        <PassportWeeklySection weeklies={passportData?.weeklies ?? []} loading={dataLoading} />
      ) : null}

      {privacy.showRivalWinsOnPublic ? (
        <PassportRivalsSection wins={passportData?.rivalWins ?? []} loading={dataLoading} />
      ) : null}

      {privacy.showFinishersOnPublic ? (
        <FinisherGallery
          userId={profile.id}
          username={profile.username}
          faction={profile.faction}
          division={profile.division}
        />
      ) : null}
    </>
  );
}
