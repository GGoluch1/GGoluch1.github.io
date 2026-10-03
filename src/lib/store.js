// A tiny observable value for state that lives outside React (sound, theme,
// the S-DAT, the umbilical cable, the easter eggs). Code reads and writes it
// with get/set; components subscribe with useStore(store).

import { useSyncExternalStore } from "react";

// `server` is the value used while prerendering, when there's no browser state.
export function createStore(initial, server = initial) {
  let value = initial;
  const listeners = new Set();

  return {
    get: () => value,
    getServer: () => server,
    set(next) {
      value = next;
      listeners.forEach((fn) => fn());
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}
