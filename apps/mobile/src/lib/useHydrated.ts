import { useSyncExternalStore } from 'react';
import { useKids } from './kids/store';
import { useApp } from './store';

const subscribe = (onChange: () => void) => {
  const a = useApp.persist.onFinishHydration(onChange);
  const b = useKids.persist.onFinishHydration(onChange);
  return () => {
    a();
    b();
  };
};
const snapshot = () => useApp.persist.hasHydrated() && useKids.persist.hasHydrated();

/** True once both saved stores (app + Kids mode) have loaded from storage. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
