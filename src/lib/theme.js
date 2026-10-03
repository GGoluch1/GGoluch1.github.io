// Eva unit color themes. Each one re-points the site's color tokens (see the
// [data-unit] rules in index.css), so every utility class follows along.
// A visitor's pick is remembered; without one, an Eva calendar date can
// suggest a unit (Asuka's birthday paints the site Unit-02 red).

import { todaysEvent } from "./calendar";
import { local } from "./storage";
import { createStore, useStore } from "./store";

export const UNITS = [
  { id: "magi", label: "MAGI", colors: ["#ff8a1f", "#ee1c33"] },
  { id: "00", label: "UNIT-00", colors: ["#6aa8ff", "#ffd23f"] },
  { id: "01", label: "UNIT-01", colors: ["#a98aff", "#8cff3a"] },
  { id: "02", label: "UNIT-02", colors: ["#ff6464", "#ffb000"] },
];

const KEY = "magi-unit";
const unit = createStore("magi");

function apply(id) {
  const next = UNITS.some((u) => u.id === id) ? id : "magi";
  if (next === "magi") delete document.documentElement.dataset.unit;
  else document.documentElement.dataset.unit = next;
  unit.set(next);
}

export function initTheme() {
  apply(local.get(KEY) ?? todaysEvent()?.unit ?? "magi");
}

export function setUnit(id) {
  local.set(KEY, id);
  apply(id);
}

export const useUnit = () => useStore(unit);

// The current theme's colors as hex strings, read from the CSS tokens, for
// things drawn outside CSS (the ID card's canvas).
export function themeColors() {
  const css = getComputedStyle(document.documentElement);
  const read = (name, fallback) => css.getPropertyValue(`--color-${name}`).trim() || fallback;
  return { magi: read("magi", "#ff8a1f"), nerv: read("nerv", "#ee1c33") };
}
