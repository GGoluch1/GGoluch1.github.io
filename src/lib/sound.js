// Minimal UI sounds, synthesized with the Web Audio API (no audio files).
// Everything is soft sine/triangle blips at low volume. Off by default;
// the visitor's choice is remembered in localStorage.

import { useSyncExternalStore } from "react";

const KEY = "magi-sound";
const listeners = new Set();

let enabled = readPref();
let ctx = null;
let unlocked = false; // browsers only allow audio after a user gesture
let lastHover = 0;

function readPref() {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

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

function tone(freq, dur = 0.06, vol = 0.03, type = "sine", when = 0) {
  if (!enabled) return;
  const ac = audio();
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
};

export function setSound(on) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // storage blocked: the setting just won't persist
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useSound() {
  return useSyncExternalStore(subscribe, () => enabled);
}
