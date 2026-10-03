// A short piano arrangement of the opening line of "A Cruel Angel's Thesis"
// (残酷な天使のように 少年よ神話になれ), for the episode 26 congratulations
// scene. The melody's notes and rhythm follow the song; the chords, the
// broken-chord left hand and the ending are this arrangement's own.
// Unlike the S-DAT's pieces, the song is not public domain.
//
// The line plays twice: softly, then with the melody in octaves, before
// resolving on a C major chord instead of C minor.

import { soundContext } from "./sound";
import { play, shift } from "./synth";

export const BPM = 84;
export const BEAT = 60 / BPM; // seconds
export const LENGTH = 36; // beats, including the last chord

// The melody, as "beat:note:beats" (C minor).
const MELODY =
  "0:C5:1 1:D#5:1 2:F5:.75 2.75:D#5:.75 3.5:F5:.5 4:F5:.5 4.5:F5:.5 5:A#5:.5 5.5:G#5:.5 6:G5:.25 6.25:F5:.5 " +
  "6.75:G5:1.25 8:G5:1 9:A#5:1 10:C6:.75 10.75:F5:.75 11.5:D#5:.5 12:A#5:.5 12.5:A#5:.5 13:G5:.5 13.5:A#5:.5 " +
  "14:A#5:.75 14.75:C6:1.25";

// The harmony under it: [beat, beats, chord tones low to high].
// Cm Fm | Bb Eb | Cm Fm | Bb G7/B | Cm
const CHORDS = [
  [0, 2, "C3 G3 C4 D#4"],
  [2, 2, "F2 C3 F3 G#3"],
  [4, 2, "A#2 F3 A#3 D4"],
  [6, 2, "D#3 A#3 D#4 G4"],
  [8, 2, "C3 G3 C4 D#4"],
  [10, 2, "F2 C3 F3 G#3"],
  [12, 1.5, "A#2 F3 A#3 D4"],
  [13.5, 0.5, "B2 F3 G3 D4"],
  [14, 2, "C3 G3 C4 D#4"],
];

const ENDING = "C2 C3 G3 C4 E4 G4 C5";

// [beat, note, beats, voice, velocity]
function arrangement() {
  const notes = [];
  const melody = MELODY.split(" ").map((token) => {
    const [at, note, beats] = token.split(":");
    return [Number(at), note, Number(beats)];
  });

  for (const pass of [0, 1]) {
    const offset = pass * 16;
    for (const [at, note, beats] of melody) {
      notes.push([offset + at, note, beats * 0.95, "piano", 1]);
      // Second time round, the melody is doubled an octave below.
      if (pass) notes.push([offset + at, shift(note, -1), beats * 0.95, "pianoSoft", 1.2]);
    }
    // Left hand: the chord broken into eighth notes, held as if by the pedal.
    for (const [at, beats, chord] of CHORDS) {
      const tones = chord.split(" ");
      const end = offset + at + beats;
      if (beats <= 0.5) {
        notes.push([offset + at, tones[0], beats + 0.05, "pianoSoft", 1]);
        notes.push([offset + at, tones[1], beats + 0.05, "pianoSoft", 0.8]);
      } else {
        for (let i = 0; i < beats * 2; i++) {
          const start = offset + at + i / 2;
          notes.push([start, tones[i % tones.length], end - start + 0.05, "pianoSoft", i ? 0.8 : 1]);
        }
      }
      // ...and a deeper bass note on each chord the second time.
      if (pass) notes.push([offset + at, shift(tones[0], -1), beats, "pianoSoft", 0.9]);
    }
  }

  // The last chord, rolled from the bottom up and left to ring.
  ENDING.split(" ").forEach((note, i) => notes.push([32 + i * 0.06, note, 4, i === 6 ? "piano" : "pianoSoft", 1]));
  return notes;
}

// Plays the arrangement `delay` seconds from now, if sound is on.
// Returns a function that fades it out.
export function startThesis(delay = 0) {
  const ac = soundContext();
  if (!ac) return () => {};
  const events = arrangement().map(([at, note, beats, voice, velocity]) => [
    at * BEAT,
    note,
    beats * BEAT,
    voice,
    velocity,
  ]);
  const handle = play(ac, events, { delay, wet: 0.32 });
  return () => handle.stop(1.2);
}
