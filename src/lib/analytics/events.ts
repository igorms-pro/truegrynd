export const ANALYTICS_EVENTS = {
  shareReferral: 'growth_share_referral',
  shareRivalInvite: 'growth_share_rival_invite',
  shareWeeklyInvite: 'growth_share_weekly_invite',
  shareFinisher: 'growth_share_finisher',
  signupCompleted: 'growth_signup_completed',
  firstScoreSubmitted: 'growth_first_score_submitted',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
