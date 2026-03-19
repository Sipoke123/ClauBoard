"use client";

import { useSyncExternalStore } from "react";
import { store, type StoreState } from "./store";

/** Subscribe to the full store state. Re-renders on any state change. */
export function useStore(): StoreState {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getState(),
    () => store.getState(),
  );
}

/** Subscribe to a slice of store state. */
export function useStoreSelector<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
