/**
 * Tailwind text-color class for a leaderboard rank: gold / silver / bronze for
 * the podium, muted for everyone else. Shared by every ranked list (arena
 * leaderboard, faction hall of fame, …) so the medal palette stays in one place.
 */
export function rankMedalColorClass(rank: number): string {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-zinc-300';
  if (rank === 3) return 'text-amber-600';
  return 'text-muted-foreground';
}
