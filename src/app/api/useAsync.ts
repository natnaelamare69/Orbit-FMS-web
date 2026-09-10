import { useEffect, useState } from "react";
import { ApiError } from "./request";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch(): void;
}

/**
 * Tiny loader used by list/detail pages. Encapsulates the loading / error /
 * data states for one fetch of `fn()`. Refetch bumps an internal nonce so the
 * dependency array does not need to change.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: readonly unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fn()
      .then((value) => {
        if (!cancelled) setData(value);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return {
    data,
    loading,
    error,
    refetch: () => setNonce((n) => n + 1),
  };
}