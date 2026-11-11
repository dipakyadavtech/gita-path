import { useCallback, useEffect, useState } from 'react';

/** Loads data with loading/error state; reload() fetches again. */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true });
  const run = useCallback(load, deps);
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    run().then(
      (data) => setState({ data, loading: false }),
      (e: Error) => setState({ error: e.message, loading: false }),
    );
  }, [run]);
  useEffect(() => {
    let live = true;
    run().then(
      (data) => live && setState({ data, loading: false }),
      (e: Error) => live && setState({ error: e.message, loading: false }),
    );
    return () => {
      live = false;
    };
  }, [run]);
  return { ...state, reload };
}
