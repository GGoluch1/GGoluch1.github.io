// Shinji's S-DAT, as a real (tiny) music player. Every piece is synthesized
// note by note with the Web Audio API from public-domain compositions, so
// there are no audio files. Pressing play also puts the "earphones in":
// the page is muffled until you stop (see Isolation.jsx).

import { AIR, HALLELUJAH, JESU } from "./scores";
import { getAudio, setMuted } from "./sound";
import { createStore, useStore } from "./store";
import { line, play, score } from "./synth";

// A piece from several scored parts: { part: voice }.
function parts(source, beat, voices) {
  const events = Object.entries(voices).flatMap(([part, voice]) => score(source[part], beat, voice));
  const end = Math.max(...events.map(([at, , dur]) => at + dur));
  return { events, length: end + 1.2 };
}

// Bach, Cello Suite No. 1 in G major: the prelude's opening bars.
function cello() {
  const bars = [
    "G2 D3 B3 A3 B3 D3 B3 D3 G2 D3 B3 A3 B3 D3 B3 D3",
    "G2 E3 C4 B3 C4 E3 C4 E3 G2 E3 C4 B3 C4 E3 C4 E3",
    "G2 F#3 C4 B3 C4 F#3 C4 F#3 G2 F#3 C4 B3 C4 F#3 C4 F#3",
    "G2 G3 B3 A3 B3 G3 B3 G3 G2 G3 B3 A3 B3 G3 B3 F#3",
  ];
  const step = 0.15;
  const notes = [...bars, ...bars].join(" ");
  return { events: line(notes, step, "cello", 0, 1.4), length: notes.split(" ").length * step + 0.6 };
}

// Beethoven, Ode to Joy (the tune Kaworu hums). [note, beats]
function ode() {
  // prettier-ignore
  const tune = [
    ["E4", 1], ["E4", 1], ["F4", 1], ["G4", 1], ["G4", 1], ["F4", 1], ["E4", 1], ["D4", 1],
    ["C4", 1], ["C4", 1], ["D4", 1], ["E4", 1], ["E4", 1.5], ["D4", 0.5], ["D4", 2],
    ["E4", 1], ["E4", 1], ["F4", 1], ["G4", 1], ["G4", 1], ["F4", 1], ["E4", 1], ["D4", 1],
    ["C4", 1], ["C4", 1], ["D4", 1], ["E4", 1], ["D4", 1.5], ["C4", 0.5], ["C4", 2],
  ];
  const beat = 0.36;
  const events = [];
  let t = 0;
  for (const [note, beats] of tune) {
    events.push([t, note, beats * beat * 0.95, "flute"]);
    t += beats * beat;
  }
  // A soft bass under each bar
  "C3 G2 C3 G2 C3 G2 C3 G2".split(" ").forEach((n, i) => events.push([i * 4 * beat, n, 4 * beat, "bass"]));
  return { events, length: t + 0.6 };
}

// Pachelbel, Canon in D: the ground bass, with the violins entering in turn.
function canon() {
  const step = 0.9;
  const bass = "D3 A2 B2 F#2 G2 D2 G2 A2";
  const first = "F#5 E5 D5 C#5 B4 A4 B4 C#5";
  const second = "D5 C#5 B4 A4 G4 F#4 G4 E4";
  const span = 8 * step;
  const events = [
    ...[0, 1, 2].flatMap((c) => line(bass, step, "bass", c * span, 1)),
    ...line(first, step, "strings", span),
    ...line(second, step, "strings", 2 * span),
    ...line(first, step, "strings", 2 * span),
  ];
  return { events, length: 3 * span + 0.8 };
}

// Track 27 has never played before. An original piece: a slow sunrise in C.
function sunrise() {
  const chords = [
    ["C3 G3 E4 G4 C5", "E5"],
    ["B2 G3 D4 G4 B4", "D5"],
    ["A2 E3 C4 E4 A4", "C5"],
    ["F2 C3 A3 C4 F4", "C5"],
    ["E2 G3 C4 E4 G4", "G5"],
    ["F2 A3 C4 F4 A4", "F5"],
    ["G2 D3 B3 D4 G4", "D5"],
    ["C3 G3 C4 E4 C5", "C5"],
  ];
  const step = 0.24;
  const events = [];
  chords.forEach(([chord, top], i) => {
    const n = chord.split(" ");
    const pattern = [n[0], n[1], n[2], n[3], n[4], n[3], n[2], n[1]];
    const start = i * 8 * step;
    pattern.forEach((note, j) => events.push([start + j * step, note, 1.2, "piano"]));
    events.push([start, top, 8 * step, "strings"]);
  });
  return { events, length: chords.length * 8 * step + 1.5 };
}

// The classical pieces Evangelion itself uses: Air and Jesu, Joy in
// The End of Evangelion, the Hallelujah chorus in episode 22.
const air = () => parts(AIR, 1.2, { melody: "violin", inner: "inner", bass: "cello" });
const jesu = () => parts(JESU, 0.55, { triplets: "flute", second: "inner", bass: "bass", chorale: "strings" });
const hallelujah = () => parts(HALLELUJAH, 0.6, { soprano: "choir", alto: "choir", tenor: "choir", bass: "cello" });

export const TAPE = [
  { title: "CELLO SUITE NO. 1 // PRELUDE", composer: "J.S. BACH", build: cello },
  { title: "ODE TO JOY", composer: "L.V. BEETHOVEN", build: ode },
  { title: "CANON IN D", composer: "J. PACHELBEL", build: canon },
  { title: "AIR // ORCHESTRAL SUITE NO. 3", composer: "J.S. BACH", build: air },
  { title: "JESU, JOY OF MAN'S DESIRING", composer: "J.S. BACH", build: jesu },
  { title: "HALLELUJAH // MESSIAH", composer: "G.F. HANDEL", build: hallelujah },
];
export const TRACK_27 = { title: "NEVER PLAYED BEFORE", composer: "UNKNOWN", build: sunrise };

const player = createStore({ playing: false, index: 0, special: false });
let bus = null;
let timer = 0;

function emit(next) {
  const state = { ...player.get(), ...next };
  setMuted(state.playing);
  player.set(state);
}

function silence() {
  clearTimeout(timer);
  bus?.stop();
  bus = null;
}

function start(index, special = false) {
  const ac = getAudio();
  if (!ac) return false;
  silence();
  const piece = (special ? TRACK_27 : TAPE[index]).build();
  bus = play(ac, piece.events);
  // After track 27, the tape goes back to the beginning.
  timer = setTimeout(() => start(special ? 0 : (index + 1) % TAPE.length), piece.length * 1000);
  emit({ playing: true, index: special ? 0 : index, special });
  return true;
}

export const sdat = {
  play: () => start(player.get().index),
  stop() {
    silence();
    emit({ playing: false, special: false });
  },
  next: () => start((player.get().index + 1) % TAPE.length),
  track27: () => start(0, true),
};

export const useSdat = () => useStore(player);
