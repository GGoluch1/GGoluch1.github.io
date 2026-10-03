// Minimal UI sounds, synthesized with the Web Audio API (no audio files).
// Everything is soft sine/triangle blips at low volume. On by default (the
// browser still waits for a first click or key press); turning it off is
// remembered in localStorage.

import { local } from "./storage";
import { createStore, useStore } from "./store";

const KEY = "magi-sound";

const enabled = createStore(local.get(KEY) !== "off", false); // off when prerendering
let ctx = null;
let unlocked = false; // browsers only allow audio after a user gesture
let lastHover = 0;
let muted = false; // S-DAT isolation mode and a dead battery silence the UI

if (typeof window !== "undefined") {
  const unlock = () => {
    unlocked = true;
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

function audio() {
  if (!unlocked) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// The AudioContext, or null when sounds are off, muted, or not allowed yet.
function live() {
  return enabled.get() && !muted ? audio() : null;
}

function tone(freq, dur = 0.06, vol = 0.03, type = "sine", when = 0) {
  const ac = live();
  if (!ac) return;

  const t = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// Pitch glide from one frequency to another.
function slide(from, to, dur, vol, type = "sine", when = 0) {
  const ac = live();
  if (!ac) return;

  const t = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

let noise = null;

// One second of white noise, made once and reused.
function noiseBuffer(ac) {
  if (!noise) {
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

// A short burst of filtered white noise (claps, the positron beam).
function burst(when, dur, vol, freq, type = "bandpass", out = null) {
  const ac = live();
  if (!ac) return;

  const t = ac.currentTime + when;
  const src = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  src.buffer = noiseBuffer(ac);
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = 0.9;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src
    .connect(filter)
    .connect(gain)
    .connect(out ?? ac.destination);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

// Beethoven's Ode to Joy, the tune Kaworu hums. [note, beats]
const NOTE = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392 };
// prettier-ignore
const ODE = [
  ["E", 1], ["E", 1], ["F", 1], ["G", 1], ["G", 1], ["F", 1], ["E", 1], ["D", 1],
  ["C", 1], ["C", 1], ["D", 1], ["E", 1], ["E", 1.5], ["D", 0.5], ["D", 2],
  ["E", 1], ["E", 1], ["F", 1], ["G", 1], ["G", 1], ["F", 1], ["E", 1], ["D", 1],
  ["C", 1], ["C", 1], ["D", 1], ["E", 1], ["D", 1.5], ["C", 0.5], ["C", 2],
];

export const sfx = {
  hover() {
    const now = performance.now();
    if (now - lastHover < 60) return;
    lastHover = now;
    tone(1500, 0.035, 0.01);
  },
  click() {
    tone(880, 0.06, 0.025);
    tone(1320, 0.08, 0.018, "sine", 0.05);
  },
  tick() {
    tone(1800, 0.025, 0.008, "triangle");
  },
  approve() {
    tone(660, 0.12, 0.022);
    tone(990, 0.16, 0.018, "sine", 0.08);
  },
  granted() {
    [523, 659, 784].forEach((f, i) => tone(f, 0.35, 0.018, "sine", i * 0.09));
  },
  boot() {
    [440, 554, 659, 880].forEach((f, i) => tone(f, 0.45, 0.016, "sine", i * 0.1));
  },

  // --- Easter eggs ---
  seal() {
    tone(110, 1.4, 0.03);
    tone(164.8, 1.6, 0.022, "sine", 0.18);
  },
  alarm() {
    [0, 0.22, 0.44, 0.66].forEach((w, i) => tone(i % 2 ? 660 : 880, 0.18, 0.01, "square", w));
  },
  asuka() {
    slide(900, 260, 0.35, 0.02, "sawtooth");
    tone(196, 0.18, 0.012, "square", 0.32);
  },
  quack() {
    slide(720, 420, 0.12, 0.018, "square");
    slide(660, 380, 0.14, 0.018, "square", 0.16);
  },
  powerDown() {
    slide(440, 40, 1.3, 0.022, "sawtooth");
  },
  charge() {
    slide(110, 1500, 0.9, 0.012);
  },
  beam() {
    burst(0, 0.6, 0.06, 2600);
    slide(2200, 180, 0.55, 0.02, "sawtooth");
  },
  flood() {
    slide(90, 30, 2.2, 0.04);
    for (let i = 0; i < 18; i++) tone(300 + Math.random() * 500, 0.05, 0.008, "sine", 0.3 + Math.random() * 1.6);
  },
  atField() {
    tone(1900, 0.09, 0.008, "sine");
    tone(2850, 0.12, 0.006, "sine", 0.04);
  },
  unplug() {
    slide(180, 60, 0.25, 0.03, "square");
  },
  plug() {
    slide(60, 180, 0.2, 0.03, "square");
  },
  ode() {
    const beat = 0.34;
    let t = 0;
    for (const [note, beats] of ODE) {
      tone(NOTE[note], beats * beat * 0.92, 0.026, "triangle", t);
      tone(NOTE[note] / 2, beats * beat * 0.92, 0.008, "sine", t);
      t += beats * beat;
    }
  },
  // One hand clap: a few bursts of noise a few milliseconds apart.
  clap(vol = 0.06) {
    burst(0, 0.03, vol, 1300);
    burst(0.008, 0.035, vol * 0.8, 1800);
    burst(0.017, 0.07, vol * 0.6, 2300);
  },
  // Glass under strain: tiny ticks climbing in pitch.
  creak() {
    for (let i = 0; i < 12; i++) tone(2600 + i * 180, 0.025, 0.006, "triangle", i * 0.07);
    slide(1700, 2900, 0.85, 0.006, "sine");
  },
  // Glass breaking: a crash of bright noise, then shards ringing as they fall.
  shatter() {
    burst(0, 0.5, 0.09, 3800, "highpass");
    burst(0, 0.25, 0.05, 900);
    for (let i = 0; i < 26; i++) {
      tone(
        2400 + Math.random() * 4200,
        0.12 + Math.random() * 0.3,
        0.004 + Math.random() * 0.006,
        "sine",
        Math.random() * 0.9,
      );
    }
  },
  // Unit-01 goes berserk: a low, tearing roar.
  roar() {
    slide(150, 52, 1.5, 0.05, "sawtooth");
    slide(158, 55, 1.5, 0.03, "sawtooth", 0.04);
    burst(0, 1.3, 0.08, 420, "lowpass");
  },
};

// A crowd applauding for `seconds`: claps scattered all through it, swelling
// in and dying away at the end. Returns a function that fades it out early.
export function startApplause(seconds, perSecond = 22) {
  const ac = live();
  if (!ac) return () => {};

  const bus = ac.createGain();
  const t0 = ac.currentTime;
  bus.gain.setValueAtTime(0.0001, t0);
  bus.gain.exponentialRampToValueAtTime(1, t0 + 0.8);
  bus.gain.setValueAtTime(1, t0 + Math.max(seconds - 2, 1));
  bus.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
  bus.connect(ac.destination);
  for (let i = 0; i < seconds * perSecond; i++) {
    const at = Math.random() * seconds;
    burst(at, 0.04 + Math.random() * 0.05, 0.01 + Math.random() * 0.016, 1100 + Math.random() * 1900, "bandpass", bus);
  }

  return () => {
    const t = ac.currentTime;
    bus.gain.cancelScheduledValues(t);
    bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), t);
    bus.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    setTimeout(() => bus.disconnect(), 800);
  };
}

// Low drone for Terminal Dogma. Returns a function that fades it out.
export function startHum() {
  const ac = live();
  if (!ac) return () => {};

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.03, ac.currentTime + 2.5);
  gain.connect(ac.destination);
  const oscs = [55, 55.7, 82.4].map((f) => {
    const osc = ac.createOscillator();
    osc.frequency.value = f;
    osc.connect(gain);
    osc.start();
    return osc;
  });

  return () => {
    const t = ac.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    oscs.forEach((o) => o.stop(t + 0.9));
  };
}

// Waves on the red sea after End of Evangelion: looping noise through a
// lowpass filter, swelling and falling slowly. Returns a function that fades it out.
export function startWaves() {
  const ac = live();
  if (!ac) return () => {};

  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac);
  src.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 520;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.05, ac.currentTime + 3);
  // A slow wobble on top of the volume: one wave every eight seconds or so.
  const swell = ac.createOscillator();
  const depth = ac.createGain();
  swell.frequency.value = 0.12;
  depth.gain.value = 0.035;
  swell.connect(depth).connect(gain.gain);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start();
  swell.start();

  return () => {
    const t = ac.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1);
    depth.gain.setTargetAtTime(0, t, 0.2);
    src.stop(t + 1.1);
    swell.stop(t + 1.1);
  };
}

export const soundOn = () => enabled.get();

export function setMuted(on) {
  muted = on;
}

// The shared AudioContext, for the S-DAT's music (which plays even with
// interface sounds off, since pressing play is a request for sound).
// Null until the visitor has interacted with the page.
export const getAudio = () => audio();

// The AudioContext only when interface sounds are on (and not muted by the
// S-DAT or a dead battery): for sound that should follow the visitor's choice,
// like the Third Impact music.
export const soundContext = () => live();

export function setSound(on) {
  local.set(KEY, on ? "on" : "off");
  enabled.set(on);
}

export const useSound = () => useStore(enabled);
