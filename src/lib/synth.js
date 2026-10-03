// Note-by-note synthesis with the Web Audio API, shared by the S-DAT and the
// Third Impact music. A piece is a list of [seconds, note, seconds, voice,
// velocity?] events; play() schedules them all through a small reverb and
// returns a handle that fades them out. No audio files anywhere.

const SEMITONE = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };

const parse = (name) => name.match(/^([A-G]#?)(\d)$/);

export function freq(name) {
  const [, note, octave] = parse(name);
  const midi = (Number(octave) + 1) * 12 + SEMITONE[note];
  return 440 * 2 ** ((midi - 69) / 12);
}

// The same note, `octaves` higher (or lower, when negative).
export function shift(name, octaves) {
  const [, note, octave] = parse(name);
  return `${note}${Number(octave) + octaves}`;
}

// Each voice is an oscillator with an envelope; the sawtooth voices run
// through a lowpass filter to soften the raw waveform. Piano voices are
// struck strings instead (see pianoNote).
const VOICES = {
  cello: { type: "sawtooth", vol: 0.035, attack: 0.03, filter: 1100 },
  strings: { type: "sawtooth", vol: 0.02, attack: 0.08, filter: 1800 },
  violin: { type: "sawtooth", vol: 0.024, attack: 0.07, filter: 2400 },
  choir: { type: "sawtooth", vol: 0.016, attack: 0.05, filter: 1500 },
  bass: { type: "triangle", vol: 0.06, attack: 0.02 },
  flute: { type: "triangle", vol: 0.04, attack: 0.02 },
  inner: { type: "triangle", vol: 0.018, attack: 0.05 },
  piano: { piano: true, vol: 0.06 },
  pianoSoft: { piano: true, vol: 0.032 },
};

// Builds [time, note, duration, voice] events from a list of notes at a fixed step.
export function line(notes, step, voice, start = 0, hold = 1.1) {
  return notes.split(" ").map((n, i) => [start + i * step, n, step * hold, voice]);
}

// Builds events from "beat:note:beats" tokens (see scores.js), `beat` seconds per beat.
export function score(text, beat, voice, velocity = 1) {
  return text.split(" ").map((token) => {
    const [at, note, beats] = token.split(":");
    return [at * beat, note, beats * beat, voice, velocity];
  });
}

// A struck string: three partials (fundamental, octave, twelfth) that start
// bright and mellow as they ring, decaying on their own and damped quickly
// when the key is let go after `dur` seconds.
function pianoNote(ac, dest, f, start, dur, vol) {
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(f * 8, 9000), start);
  filter.frequency.exponentialRampToValueAtTime(Math.max(f * 2.5, 500), start + 1.6);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.006);
  gain.gain.setTargetAtTime(vol * 0.28, start + 0.006, 0.4);
  gain.gain.setTargetAtTime(0.0001, start + dur, 0.16);
  filter.connect(gain).connect(dest);

  for (const [type, multiple, level] of [
    ["triangle", 1, 1],
    ["sine", 2, 0.32],
    ["sine", 3, 0.1],
  ]) {
    const osc = ac.createOscillator();
    const partial = ac.createGain();
    osc.type = type;
    osc.frequency.value = f * multiple;
    partial.gain.value = level;
    osc.connect(partial).connect(filter);
    osc.start(start);
    osc.stop(start + dur + 1);
  }
}

function toneNote(ac, dest, v, f, start, dur, vol) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = v.type;
  osc.frequency.value = f;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + v.attack);
  gain.gain.setValueAtTime(vol, start + Math.max(dur - 0.08, v.attack));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  let node = osc;
  if (v.filter) {
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = v.filter;
    osc.connect(filter);
    node = filter;
  }
  node.connect(gain).connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

// The reverb's impulse response: two seconds of decaying stereo noise, made
// once per AudioContext.
const impulses = new WeakMap();
function impulse(ac) {
  if (!impulses.has(ac)) {
    const length = Math.floor(ac.sampleRate * 2.2);
    const buffer = ac.createBuffer(2, length, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    }
    impulses.set(ac, buffer);
  }
  return impulses.get(ac);
}

// Schedules every event, starting `delay` seconds from now, through a dry
// path and a reverb send (`wet` is the reverb's level).
// Returns { stop(fade) }, which fades the piece out and cleans up after it.
export function play(ac, events, { delay = 0.05, wet = 0.2 } = {}) {
  const out = ac.createGain();
  out.connect(ac.destination);
  const room = ac.createConvolver();
  room.buffer = impulse(ac);
  const send = ac.createGain();
  send.gain.value = wet;
  out.connect(room).connect(send).connect(ac.destination);

  const t0 = ac.currentTime + delay;
  for (const [at, note, dur, name, velocity = 1] of events) {
    const v = VOICES[name];
    const start = t0 + at;
    if (v.piano) pianoNote(ac, out, freq(note), start, dur, v.vol * velocity);
    else toneNote(ac, out, v, freq(note), start, dur, v.vol * velocity);
  }

  return {
    stop(fade = 0.15) {
      const t = ac.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(out.gain.value, t);
      out.gain.linearRampToValueAtTime(0, t + fade);
      // Leave time for the reverb's tail before disconnecting.
      setTimeout(
        () => {
          out.disconnect();
          send.disconnect();
        },
        (fade + 2.4) * 1000,
      );
    },
  };
}
