'use client';

type Props = {
  data: unknown;
};

export function AuthDebugPanel({ data }: Props) {
  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-3">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground">DEBUG</p>
      <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-muted-foreground">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
