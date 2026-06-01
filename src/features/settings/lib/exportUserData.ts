import { listMyScores } from '@/features/profile/services/scores';
import { getProfileById } from '@/features/profile/services/profile';

export async function exportUserData(userId: string): Promise<Blob> {
  const [profile, scores] = await Promise.all([getProfileById(userId), listMyScores(userId, 500)]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile,
    scores,
  };

  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
