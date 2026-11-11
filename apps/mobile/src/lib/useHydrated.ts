import { useEffect, useState } from 'react';
import { useApp } from './store';

/** True once the persisted store has loaded from storage. */
export function useHydrated() {
  const [ready, setReady] = useState(useApp.persist.hasHydrated());
  useEffect(() => {
    const unsub = useApp.persist.onFinishHydration(() => setReady(true));
    if (useApp.persist.hasHydrated()) setReady(true);
    return unsub;
  }, []);
  return ready;
}
