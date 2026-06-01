'use client';

import type { Challenge } from '@/lib/types/database.types';

type Props = {
  challenges: Challenge[];
  selectedIds: string[];
  loading: boolean;
  error: string | null;
  disabled: boolean;
  onToggle: (challengeId: string) => void;
  onRetry: () => void;
  selectedLabel: string;
  labels: {
    title: string;
    hint: string;
    loading: string;
    error: string;
    retry: string;
    empty: string;
  };
};

export function RivalChallengePicker({
  challenges,
  selectedIds,
  loading,
  error,
  disabled,
  onToggle,
  onRetry,
  selectedLabel,
  labels,
}: Props) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {labels.loading}
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">{labels.error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex min-h-11 items-center rounded-md border border-border px-3 text-xs font-black uppercase tracking-[0.18em]"
        >
          {labels.retry}
        </button>
      </div>
    );
  }

  if (challenges.length === 0) {
    return <p className="text-sm text-muted-foreground">{labels.empty}</p>;
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-xs font-black uppercase tracking-[0.18em] text-primary">
        {labels.title}
      </legend>
      <p className="text-sm text-muted-foreground">{labels.hint}</p>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {selectedLabel}
      </p>
      <ul className="max-h-64 space-y-2 overflow-y-auto rounded-sm border border-border p-2">
        {challenges.map((challenge) => {
          const checked = selectedIds.includes(challenge.id);
          const inputId = `rival-challenge-${challenge.id}`;
          return (
            <li key={challenge.id}>
              <label
                htmlFor={inputId}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-sm px-2 py-2 hover:bg-muted/60"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(challenge.id)}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <span>
                  <span className="block text-sm font-black uppercase tracking-tight">
                    {challenge.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {challenge.score_type.toUpperCase()}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
