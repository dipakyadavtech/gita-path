import { useSyncExternalStore } from 'react';
import { useApp } from './store';

/** True once the persisted store has loaded from storage. */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useApp.persist.onFinishHydration(onChange),
    () => useApp.persist.hasHydrated(),
    () => useApp.persist.hasHydrated(),
  );
}
