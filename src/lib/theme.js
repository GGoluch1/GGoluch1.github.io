// Eva unit color themes. Each one re-points the site's color tokens (see the
// [data-unit] rules in index.css), so every utility class follows along.
// A visitor's pick is remembered; without one, an Eva calendar date can
// suggest a unit (Asuka's birthday paints the site Unit-02 red).

import { useSyncExternalStore } from "react";
import { todaysEvent } from "./calendar";

export const UNITS = [
  { id: "magi", label: "MAGI", colors: ["#ff8a1f", "#ee1c33"] },
  { id: "00", label: "UNIT-00", colors: ["#6aa8ff", "#ffd23f"] },
  { id: "01", label: "UNIT-01", colors: ["#a77bff", "#8cff3a"] },
  { id: "02", label: "UNIT-02", colors: ["#ff3d3d", "#ffb000"] },
];

const KEY = "magi-unit";
const listeners = new Set();
let unit = "magi";

function stored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function apply(id) {
  unit = UNITS.some((u) => u.id === id) ? id : "magi";
  if (unit === "magi") delete document.documentElement.dataset.unit;
  else document.documentElement.dataset.unit = unit;
  listeners.forEach((fn) => fn());
}

export function initTheme() {
  apply(stored() ?? todaysEvent()?.unit ?? "magi");
}

export function setUnit(id) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // storage blocked: the theme lasts until the page closes
  }
  apply(id);
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useUnit() {
  return useSyncExternalStore(subscribe, () => unit, () => "magi");
}
