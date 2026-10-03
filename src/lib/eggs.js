// The easter-egg hunt. Seven seals, one per eye on SEELE's mask; breaking all
// seven opens Heaven's Door to Terminal Dogma below the footer. Pen Pen, the
// S-DAT's track 27 and Berserk mode are bonuses that aren't part of the scenario.
// Pulling the Lance plays the TV ending first, then End of Evangelion.
//
// Progress lives in this browser's localStorage.
// Add ?seele to the URL to reset it (in dev, ?seele=all breaks every seal).

import { track } from "./analytics";
import { local } from "./storage";
import { createStore, useStore } from "./store";

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

export const BONUSES = [
  {
    id: "penpen",
    name: "PEN PEN",
    line: "A warm-water penguin. Not in the scenario.",
    hint: "Something warm-blooded lives behind the hazard tape at the bottom.",
  },
  {
    id: "track27",
    name: "TRACK 27",
    line: "Track 27. The tape finally moved on.",
    hint: "The S-DAT only knows two tracks. Hold on long enough and it might learn a third.",
  },
  {
    id: "berserk",
    name: "BERSERK",
    line: "Unit-01 has gone berserk. The pilot is not in control.",
    hint: "Some codes are older than NERV. Up, up, down, down…",
  },
];

const KEY = "magi-seele";
// ended: saw the TV ending (episode 26). eoe: saw End of Evangelion.
const EMPTY = { found: new Set(), ended: false, eoe: false };
const announcers = new Set();

const store = createStore(load(), EMPTY);
const state = () => store.get();

function load() {
  if (typeof window === "undefined") return EMPTY;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("seele")) {
      const all = import.meta.env.DEV && params.get("seele") === "all";
      params.delete("seele");
      const query = params.toString() ? `?${params}` : "";
      history.replaceState(null, "", window.location.pathname + query + window.location.hash);
      const next = all ? { ...EMPTY, found: new Set(SEALS.map((s) => s.id)) } : EMPTY;
      save(next);
      return next;
    }
    const raw = JSON.parse(local.get(KEY) ?? "{}");
    return { found: new Set(raw.found ?? []), ended: Boolean(raw.ended), eoe: Boolean(raw.eoe) };
  } catch {
    return EMPTY;
  }
}

function save(s) {
  local.set(KEY, JSON.stringify({ found: [...s.found], ended: s.ended, eoe: s.eoe }));
}

function update(next) {
  save(next);
  store.set(next);
}

function announce(message) {
  announcers.forEach((fn) => fn(message));
}

export const sealCount = (s) => SEALS.filter((seal) => s.found.has(seal.id)).length;
export const isUnlocked = (s) => sealCount(s) === SEALS.length;

// Marks an egg as found. Returns false if it already was.
export function find(id) {
  if (state().found.has(id)) return false;
  update({ ...state(), found: new Set(state().found).add(id) });

  const index = SEALS.findIndex((s) => s.id === id);
  const egg = index >= 0 ? SEALS[index] : BONUSES.find((b) => b.id === id);
  track(`egg-${id}`, `Easter egg: ${egg.name}`);
  announce({ key: id, number: index >= 0 ? String(index + 1).padStart(2, "0") : "00", line: egg.line });

  if (index >= 0 && isUnlocked(state())) {
    track("egg-all-seals", "Easter egg: all seven seals");
    announce({ key: "unlock", number: "全", line: "All seals are broken. Proceed to Terminal Dogma." });
  }
  return true;
}

// ending: "tv" (episode 26) or "eoe" (The End of Evangelion).
export function endScenario(ending = "tv") {
  const field = ending === "eoe" ? "eoe" : "ended";
  if (!state()[field]) {
    track(
      ending === "eoe" ? "end-of-evangelion" : "third-impact",
      `Easter egg: ${ending === "eoe" ? "End of Evangelion" : "Third Impact"}`,
    );
  }
  update({ ...state(), [field]: true });
}

export function resetSeele() {
  update(EMPTY);
}

// The next unbroken seal's hint, then the bonuses', then nothing.
export function nextHint() {
  const egg = [...SEALS, ...BONUSES].find((s) => !state().found.has(s.id));
  return egg?.hint ?? null;
}

export const useSeele = () => useStore(store);

// Monolith notifications for each newly found egg.
export function onAnnounce(fn) {
  announcers.add(fn);
  return () => announcers.delete(fn);
}
