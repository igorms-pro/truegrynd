import type { Division } from '@/lib/types/database.types';

export type DivisionBadgeClasses = {
  bg: string;
  text: string;
  border: string;
};

export function getDivisionBadgeClasses(division: Division): DivisionBadgeClasses {
  if (division === 'rookie') {
    return {
      bg: 'bg-[var(--division-rookie)]/15',
      text: 'text-[var(--division-rookie)]',
      border: 'border-[var(--division-rookie)]/40',
    };
  }
  if (division === 'regular') {
    return {
      bg: 'bg-[var(--division-regular)]/15',
      text: 'text-[var(--division-regular)]',
      border: 'border-[var(--division-regular)]/40',
    };
  }
  if (division === 'savage') {
    return {
      bg: 'bg-[var(--division-savage)]/15',
      text: 'text-[var(--division-savage)]',
      border: 'border-[var(--division-savage)]/40',
    };
  }
  return {
    bg: 'bg-[var(--division-elite)]/15',
    text: 'text-[var(--division-elite)]',
    border: 'border-[var(--division-elite)]/40',
  };
}

export function getDivisionColor(division: Division): string {
  if (division === 'rookie') return '#6b9bd1';
  if (division === 'regular') return '#9ca3af';
  if (division === 'savage') return '#f97316';
  return '#ffb800';
}
