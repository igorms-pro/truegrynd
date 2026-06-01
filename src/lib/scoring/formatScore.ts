import type { ScoreType } from '@/lib/types/database.types';

export function formatScore(value: number, type: ScoreType): string {
  if (type === 'time') return formatTime(value);
  return formatReps(value);
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${pad2(minutes)}:${pad2(secs)}`;
}

export function formatReps(reps: number): string {
  if (!Number.isFinite(reps) || reps < 0) return '0';
  return Math.floor(reps).toLocaleString();
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
