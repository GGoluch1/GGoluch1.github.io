// The umbilical cable. Unplugging it switches to internal power, which lasts
// five minutes, as in the show. At zero the site hits its activity limit and
// goes limp until the cable is plugged back in. (In dev, ?battery=10 makes the
// battery last 10 seconds instead.)

import { useSyncExternalStore } from "react";
import { sdat } from "./sdat";
import { setMuted, sfx } from "./sound";

function batteryMs() {
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const s = Number(new URLSearchParams(window.location.search).get("battery"));
    if (s > 0) return s * 1000;
  }
  return 5 * 60 * 1000;
}

const listeners = new Set();
let state = { mode: "external", deadline: 0 }; // external | internal | dead
let timer = 0;

function emit(next) {
  state = next;
  listeners.forEach((fn) => fn());
}

export function unplug() {
  if (state.mode !== "external") return;
  sfx.unplug();
  const ms = batteryMs();
  emit({ mode: "internal", deadline: performance.now() + ms });
  timer = setTimeout(() => {
    sfx.powerDown();
    sdat.stop();
    setMuted(true);
    emit({ mode: "dead", deadline: 0 });
  }, ms);
}

export function plugIn() {
  clearTimeout(timer);
  setMuted(false);
  emit({ mode: "external", deadline: 0 });
  sfx.plug();
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const SERVER = { mode: "external", deadline: 0 };
export function usePower() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}
