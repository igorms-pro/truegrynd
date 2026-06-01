/**
 * Canonical async UI state for hooks that fetch data outside React Query.
 * Prefer deriving UI from this union instead of separate loading/error booleans.
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string };

export function asyncLoading<T>(): AsyncState<T> {
  return { status: 'loading' };
}

export function asyncReady<T>(data: T): AsyncState<T> {
  return { status: 'ready', data };
}

export function asyncError<T>(message: string): AsyncState<T> {
  return { status: 'error', message };
}
