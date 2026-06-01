export {
  computeConsistencyScore,
  computeGlobalRating,
  computeProfileRating,
} from '@/lib/rating/computeProfileRating';
export {
  DIVISION_PROMOTION_RULES,
  resolveDivisionPromotion,
} from '@/lib/rating/divisionFromRating';
export { inferRatingAxis } from '@/lib/rating/inferRatingAxis';
export type {
  ChallengeRatingAxis,
  ConsistencyInput,
  ProfileRating,
  ProfileRatingSnapshot,
  RatingAxis,
  ValidatedScoreSample,
} from '@/lib/rating/types';
export { CHALLENGE_RATING_AXES, RATING_AXES } from '@/lib/rating/types';
