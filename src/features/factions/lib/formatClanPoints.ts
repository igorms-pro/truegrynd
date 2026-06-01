export function formatClanPoints(points: number): string {
  if (!Number.isFinite(points)) return '0';
  return Math.round(points).toLocaleString();
}
