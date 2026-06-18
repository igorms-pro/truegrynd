'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Tabs, type TabItem } from '@/components/Tabs';
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
  const tTabs = useTranslations('profile.tabs');
  const privacy = parsePassportPrivacy(profile);
  const passportState = usePassportData(profile.id, profile.division);
  const ratingState = useProfileRating(profile.id);

  const dataLoading = passportState.state.status === 'loading';
  const passportData = passportState.state.status === 'ready' ? passportState.state.data : null;
  const dataError = passportState.state.status === 'error' ? passportState.state.error : null;

  const overview: ReactNode[] = [];
  if (privacy.showDivisionOnPublic) {
    overview.push(
      <PassportDivisionSection
        key="division"
        currentDivision={profile.division}
        divisions={passportData?.divisions ?? [profile.division]}
        history={passportData?.history ?? []}
        loading={dataLoading}
      />,
    );
  }
  if (privacy.showRatingOnPublic) {
    overview.push(
      <ProfileRatingCard
        key="rating"
        rating={ratingState.state.status === 'ready' ? ratingState.state.rating : null}
        loading={ratingState.state.status === 'loading'}
        error={ratingState.state.status === 'error' ? ratingState.state.error : null}
        onRetry={ratingState.refetch}
      />,
    );
  }
  if (privacy.showTopScoresOnPublic) {
    overview.push(
      <PassportTopScoresSection
        key="topScores"
        scores={passportData?.topScores ?? []}
        loading={dataLoading}
        error={dataError}
        onRetry={passportState.refetch}
      />,
    );
  }

  const activity: ReactNode[] = [];
  if (privacy.showScoreHistoryOnPublic) {
    activity.push(<ScoreHistory key="history" userId={profile.id} />);
  }
  if (privacy.showFinishersOnPublic) {
    activity.push(
      <FinisherGallery
        key="finishers"
        userId={profile.id}
        username={profile.username}
        faction={profile.faction}
        division={profile.division}
      />,
    );
  }

  const palmares: ReactNode[] = [];
  if (privacy.showBadgesOnPublic) {
    palmares.push(<PassportBadgesSection key="badges" profile={profile} />);
  }
  if (privacy.showWeekliesOnPublic) {
    palmares.push(
      <PassportWeeklySection
        key="weeklies"
        weeklies={passportData?.weeklies ?? []}
        loading={dataLoading}
      />,
    );
  }
  if (privacy.showRivalWinsOnPublic) {
    palmares.push(
      <PassportRivalsSection
        key="rivals"
        wins={passportData?.rivalWins ?? []}
        loading={dataLoading}
      />,
    );
  }

  const tabs: TabItem[] = [];
  if (overview.length) tabs.push({ id: 'overview', label: tTabs('overview'), content: overview });
  if (activity.length) tabs.push({ id: 'activity', label: tTabs('activity'), content: activity });
  if (palmares.length) tabs.push({ id: 'palmares', label: tTabs('palmares'), content: palmares });

  return <Tabs tabs={tabs} ariaLabel={tTabs('overview')} />;
}
