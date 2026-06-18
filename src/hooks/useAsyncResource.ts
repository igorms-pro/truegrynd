'use client';

import { useCallback, useEffect, useState } from 'react';

import { asyncError, asyncLoading, asyncReady, type AsyncState } from '@/lib/async-state';

type Options = {
  /** When false, no fetch runs and the state stays `idle`. */
  enabled?: boolean;
};

/**
 * One place for the "fetch outside React Query" lifecycle: loading → ready/error,
 * cancellation on unmount/dep-change, and a `refetch`. Replaces the hand-rolled
 * useState + useEffect + cancelled-flag + try/catch boilerplate that was copied
 * across ~20 data hooks.
 *
 * The hook keeps the previous state on dependency changes (no flash to loading);
 * `refetch()` explicitly resets to loading.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
  options: Options = {},
): { state: AsyncState<T>; refetch: () => void } {
  const { enabled = true } = options;
  const [state, setState] = useState<AsyncState<T>>(() =>
    enabled ? asyncLoading<T>() : { status: 'idle' },
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetcher();
        if (!cancelled) setState(asyncReady(data));
      } catch (e: unknown) {
        if (!cancelled) setState(asyncError(e instanceof Error ? e.message : 'unknown'));
      }
    })();
    return () => {
      cancelled = true;
    };
    // fetcher is intentionally excluded — callers pass stable `deps` instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey, enabled]);

  const refetch = useCallback(() => {
    setState(asyncLoading<T>());
    setReloadKey((k) => k + 1);
  }, []);

  return { state, refetch };
}
