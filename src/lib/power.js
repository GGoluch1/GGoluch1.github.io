// The umbilical cable. Unplugging it switches to internal power, which lasts
// five minutes, as in the show. At zero the site hits its activity limit and
// goes limp until the cable is plugged back in. (In dev, ?battery=10 makes the
// battery last 10 seconds instead.)

import { sdat } from "./sdat";
import { setMuted, sfx } from "./sound";
import { createStore, useStore } from "./store";

function batteryMs() {
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const s = Number(new URLSearchParams(window.location.search).get("battery"));
    if (s > 0) return s * 1000;
  }
  return 5 * 60 * 1000;
}

const power = createStore({ mode: "external", deadline: 0 }); // external | internal | dead
let timer = 0;

export function unplug() {
  if (power.get().mode !== "external") return;
  sfx.unplug();
  const ms = batteryMs();
  power.set({ mode: "internal", deadline: performance.now() + ms });
  timer = setTimeout(() => {
    sfx.powerDown();
    sdat.stop();
    setMuted(true);
    power.set({ mode: "dead", deadline: 0 });
  }, ms);
}

export function plugIn() {
  clearTimeout(timer);
  setMuted(false);
  power.set({ mode: "external", deadline: 0 });
  sfx.plug();
}

export const usePower = () => useStore(power);
