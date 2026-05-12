export type CircuitBlock = {
  label: string;
  kind: 'reps' | 'hold';
  amount: string;
};

export type ScoringMode = 'for_time' | 'amrap';

const HOLD_TIME_RE = /^(\d{1,3}):([0-5]\d)$/;

/** Same MM:SS rules as score submission (minutes 0–999, seconds 00–59). */
export function isValidHoldTime(value: string): boolean {
  const trimmed = value.trim();
  const match = HOLD_TIME_RE.exec(trimmed);
  if (!match) return false;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return (
    Number.isFinite(minutes) &&
    Number.isFinite(seconds) &&
    minutes >= 0 &&
    seconds >= 0 &&
    seconds <= 59
  );
}

export function capDurationSeconds(value: string): number | null {
  const trimmed = value.trim();
  const match = HOLD_TIME_RE.exec(trimmed);
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null;
  return minutes * 60 + seconds;
}

export type ScoringPreambleInput = {
  mode: ScoringMode;
  amrapCap: string;
  /** FOR TIME: optional wall-clock cap (MM:SS). Slower = invalid score. */
  forTimeFinishCap: string;
};

export function buildScoringPreamble(input: ScoringPreambleInput): string {
  if (input.mode === 'for_time') {
    const lines = [
      'SCORING',
      'FORMAT: FOR TIME',
      'Complete the prescribed work as fast as possible. Lower total time wins.',
    ];
    const cap = input.forTimeFinishCap.trim();
    if (cap.length > 0) {
      lines.push(
        `FINISH UNDER: ${cap} (slower than this cap is not a valid score — do not submit).`,
      );
    }
    return lines.join('\n');
  }
  const cap = input.amrapCap.trim();
  return [
    'SCORING',
    'FORMAT: AMRAP',
    `CAP: ${cap}`,
    'As many reps or complete rounds as possible before the cap. Higher total reps / rounds wins.',
  ].join('\n');
}

export function buildFullChallengeRules(input: {
  scoringMode: ScoringMode;
  amrapCap: string;
  forTimeFinishCap: string;
  circuitBlocks: readonly CircuitBlock[];
  rulesDetail: string;
}): string {
  const preamble = buildScoringPreamble({
    mode: input.scoringMode,
    amrapCap: input.amrapCap,
    forTimeFinishCap: input.forTimeFinishCap,
  });
  const body = combineChallengeRules(input.circuitBlocks, input.rulesDetail);
  return [preamble, body].join('\n\n').trim();
}

/**
 * Builds the final `rules` text: optional CIRCUIT block + free-form standards.
 */
export function combineChallengeRules(
  blocks: readonly CircuitBlock[],
  rulesDetail: string,
): string {
  const movementLines: string[] = [];
  let index = 1;
  for (const b of blocks) {
    const label = b.label.trim();
    const amount = b.amount.trim();
    if (!label && !amount) continue;
    if (b.kind === 'reps') {
      movementLines.push(`${index}. ${label} — ${amount} reps`);
    } else {
      movementLines.push(`${index}. ${label} — ${amount} hold`);
    }
    index += 1;
  }

  const parts: string[] = [];
  if (movementLines.length > 0) {
    parts.push('CIRCUIT', ...movementLines, '');
  }
  const detail = rulesDetail.trim();
  if (detail.length > 0) parts.push(detail);

  return parts.join('\n').trim();
}
