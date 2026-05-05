const TIME_RE = /^(\d{1,3}):([0-5]\d)$/;

export function parseTimeInput(value: string): number | null {
  const trimmed = value.trim();
  const match = TIME_RE.exec(trimmed);
  if (!match) return null;

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null;
  if (minutes < 0) return null;

  return minutes * 60 + seconds;
}

export function isValidTimeInput(value: string): boolean {
  return parseTimeInput(value) !== null;
}
