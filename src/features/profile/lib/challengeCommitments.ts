const STORAGE_KEY = 'tg-challenge-commitments';

export type ChallengeCommitment = {
  challengeId: string;
  challengeTitle: string;
  committedAt: string;
};

type StoredEntry = ChallengeCommitment;

function readAll(): StoredEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is StoredEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as StoredEntry).challengeId === 'string' &&
        typeof (e as StoredEntry).challengeTitle === 'string' &&
        typeof (e as StoredEntry).committedAt === 'string',
    );
  } catch {
    return [];
  }
}

function writeAll(entries: StoredEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore localStorage failures
  }
}

export function listChallengeCommitments(): ChallengeCommitment[] {
  return readAll().sort(
    (a, b) => new Date(b.committedAt).getTime() - new Date(a.committedAt).getTime(),
  );
}

export function recordChallengeCommitment(challengeId: string, challengeTitle: string): void {
  const entries = readAll().filter((e) => e.challengeId !== challengeId);
  entries.unshift({
    challengeId,
    challengeTitle,
    committedAt: new Date().toISOString(),
  });
  writeAll(entries.slice(0, 50));
}

export function clearChallengeCommitment(challengeId: string): void {
  writeAll(readAll().filter((e) => e.challengeId !== challengeId));
}
