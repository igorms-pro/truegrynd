export const TIME_CAP_ERROR = 'exceeds_time_cap' as const;

export function assertTimeScoreWithinCap(input: {
  scoreType: string;
  value: number;
  maxDurationSeconds: number | null;
}): void {
  if (input.scoreType !== 'time') return;
  if (input.maxDurationSeconds == null) return;
  if (input.value > input.maxDurationSeconds) {
    throw new Error(TIME_CAP_ERROR);
  }
}
