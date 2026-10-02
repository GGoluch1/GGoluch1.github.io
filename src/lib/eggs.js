// The easter-egg hunt. Seven seals, one per eye on SEELE's mask; breaking all
// seven opens Heaven's Door to Terminal Dogma below the footer. Pen Pen is a
// bonus that isn't part of the scenario.
//
// Progress lives in this browser's localStorage.
// Add ?seele to the URL to reset it (in dev, ?seele=all breaks every seal).

import { useSyncExternalStore } from "react";
import { track } from "./analytics";

export const SEALS = [
  {
    id: "gendo",
    name: "GENDO",
    line: "The Commander made his offer. You did not leave.",
    hint: "The Commander only speaks to Children. Find your designation.",
  },
  {
    id: "sync",
    name: "SYNC TEST",
    line: "Sync ratio 400%. The pilot has been returned to us.",
    hint: "When the Commander asks, don't run away. Then hold on.",
  },
  {
    id: "iruel",
    name: "IRUEL",
    line: "The MAGI held. Casper cast the deciding vote.",
    hint: "The MAGI can be asked again. And again. And again.",
  },
  {
    id: "tabris",
    name: "TABRIS",
    line: "Song is the culmination of Lilin culture. So he says.",
    hint: "Read the emergency broadcast closely. One Angel is not like the others.",
  },
  {
    id: "asuka",
    name: "ASUKA",
    line: "The Second Child is unimpressed.",
    hint: "Knock on NERV's door. Impatiently. Five times.",
  },
  {
    id: "rei",
    name: "REI",
    line: "The First Child keeps her promises.",
    hint: "She only comes when nothing is happening. Wait.",
  },
  {
    id: "ramiel",
    name: "RAMIEL",
    line: "Operation Yashima succeeded. Japan's lights return.",
    hint: "Something blue and geometric hides in the hexagons near the top.",
  },
];

export const PENPEN = {
  id: "penpen",
  name: "PEN PEN",
  line: "A warm-water penguin. Not in the scenario.",
  hint: "Something warm-blooded lives behind the hazard tape at the bottom.",
};

const KEY = "magi-seele";
const EMPTY = { found: new Set(), ended: false };
const listeners = new Set();
const announcers = new Set();

let state = load();

function load() {
  if (typeof window === "undefined") return EMPTY;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("seele")) {
      const all = import.meta.env.DEV && params.get("seele") === "all";
      params.delete("seele");
      const query = params.toString() ? `?${params}` : "";
      history.replaceState(null, "", window.location.pathname + query + window.location.hash);
      const next = all ? { found: new Set(SEALS.map((s) => s.id)), ended: false } : EMPTY;
      save(next);
      return next;
    }
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return { found: new Set(raw.found ?? []), ended: Boolean(raw.ended) };
  } catch {
    return EMPTY;
  }
}

function save(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ found: [...s.found], ended: s.ended }));
  } catch {
    // storage blocked: progress lasts until the tab closes
  }
}

function update(next) {
  state = next;
  save(next);
  listeners.forEach((fn) => fn());
}

function announce(message) {
  announcers.forEach((fn) => fn(message));
}

export const sealCount = (s) => SEALS.filter((seal) => s.found.has(seal.id)).length;
export const isUnlocked = (s) => sealCount(s) === SEALS.length;
export const hasFound = (id) => state.found.has(id);

// Marks an egg as found. Returns false if it already was.
export function find(id) {
  if (state.found.has(id)) return false;
  update({ ...state, found: new Set(state.found).add(id) });

  const index = SEALS.findIndex((s) => s.id === id);
  const egg = index >= 0 ? SEALS[index] : PENPEN;
  track(`egg-${id}`, `Easter egg: ${egg.name}`);
  announce({ key: id, number: index >= 0 ? String(index + 1).padStart(2, "0") : "00", line: egg.line });

  if (index >= 0 && isUnlocked(state)) {
    track("egg-all-seals", "Easter egg: all seven seals");
    announce({ key: "unlock", number: "全", line: "All seals are broken. Proceed to Terminal Dogma." });
  }
  return true;
}

export function endScenario() {
  if (!state.ended) track("third-impact", "Easter egg: Third Impact");
  update({ ...state, ended: true });
}

export function resetSeele() {
  update(EMPTY);
}

// The next unbroken seal's hint, then Pen Pen's, then nothing.
export function nextHint() {
  const seal = SEALS.find((s) => !state.found.has(s.id));
  if (seal) return seal.hint;
  if (!state.found.has(PENPEN.id)) return PENPEN.hint;
  return null;
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useSeele() {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

// Monolith notifications for each newly found egg.
export function onAnnounce(fn) {
  announcers.add(fn);
  return () => announcers.delete(fn);
}
