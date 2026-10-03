import { useEffect, useState } from "react";
import { useLatest } from "../../hooks/useLatest";
import { sfx, startApplause } from "../../lib/sound";
import { BEAT } from "../../lib/thesis";
import Bust from "./Cast";
import { CAST, PARENTS, SHINJI } from "./characters";
import { Cracks, Shatter, VOID } from "./Glass";

// The end of episode 26, rebuilt. Shinji alone in the dark realizes he can
// stay; the world around him cracks and shatters like a mirror; the whole
// cast stands in a ring around him under a blue sky, clapping; quick cuts to
// each of them saying おめでとう; Gendo and Yui last; Shinji: ありがとう.
//
// Everything after the glass breaks is timed in beats of the piano music
// (src/lib/thesis.js, started by ThirdImpact.jsx), so the cuts land on it.

export const SHATTER_AT = 4; // seconds into the scene: the glass breaks, the music starts
const at = (beat) => SHATTER_AT + beat * BEAT;
const SCENE_SECONDS = at(32);

// [seconds, shot]
const SHOTS = [
  [3, { name: "crack" }],
  [SHATTER_AT, { name: "circle" }],
  ...CAST.map((_, i) => [at(4 + i), { name: "cut", index: i }]),
  [at(4 + CAST.length), { name: "parents" }],
  [at(20), { name: "thanks" }],
  [at(28), { name: "fade" }],
];

const BUST = "min(46vh, 62vw)"; // a bust's height at scale 1
const SKY =
  "radial-gradient(ellipse 22% 9% at 18% 16%, rgb(255 255 255 / 0.75), transparent), radial-gradient(ellipse 28% 8% at 78% 24%, rgb(255 255 255 / 0.6), transparent), linear-gradient(#3f9fe4, #a9dcff 55%, #eaf7ff)";
const INK = "#10223f";

const everyone = Object.fromEntries([...CAST, ...PARENTS].map((who) => [who.id, who]));

// The ring around Shinji: a back row on the horizon and a front row close to
// the camera, leaving him visible in the middle. [id, x %]
const BACK = [
  ["fuyutsuki", 12],
  ["shigeru", 23],
  ["makoto", 34],
  ["maya", 44],
  ["ritsuko", 56],
  ["kaji", 66],
  ["gendo", 77],
  ["yui", 88],
];
const FRONT = [
  ["toji", 6],
  ["kensuke", 17],
  ["hikari", 28],
  ["kaworu", 38],
  ["penpen", 50], // small, in front of Shinji
  ["rei", 62],
  ["asuka", 72],
  ["misato", 83],
];

// A bust with its bottom-centre at (x%, y), `s` times the standard height.
// y is a % of the screen, or any CSS length.
function Placed({ who, x, y, s, delay = 0, hands = true, smile = false }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: typeof y === "number" ? `${y}%` : y,
        height: `calc(${s} * ${BUST})`,
        aspectRatio: "200 / 240",
        transform: "translate(-50%, -100%)",
        "--clap-delay": `${delay}s`,
      }}
    >
      <Bust who={who} hands={hands} smile={smile} className="h-full w-full" />
    </div>
  );
}

const ShinjiAlone = () => <Placed who={SHINJI} x={50} y={70} s={0.58} hands={false} />;

const LINE = "僕は、ここにいてもいいんだ！";

function Void({ cracking }) {
  return (
    <div className="absolute inset-0 animate-fade-in" style={{ background: VOID }}>
      {cracking && <Cracks />}
      <ShinjiAlone />
      <div className="absolute inset-x-0 bottom-[8%] px-6 text-center">
        <p className="font-title text-2xl font-black text-paper sm:text-4xl">
          {[...LINE].map((ch, i) => (
            <span key={i} className="animate-[fade-in_0.12s_both]" style={{ animationDelay: `${0.6 + i * 0.11}s` }}>
              {ch}
            </span>
          ))}
        </p>
        <p className="mt-2 animate-[fade-in_0.8s_both] text-xs tracking-[0.4em] text-paper/70 [animation-delay:2.2s]">
          I CAN STAY HERE!
        </p>
      </div>
    </div>
  );
}

function Circle() {
  // The broken glass (and a copy of Shinji in front of it) only for the break.
  const [glass, setGlass] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setGlass(false), 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    // On tall phone screens the front row moves up, closer to Shinji.
    <div className="absolute inset-0 overflow-hidden [--front:104%] portrait:[--front:94%]" style={{ background: SKY }}>
      <div
        className="absolute inset-0 origin-[50%_60%] animate-[push-in_ease-out_both]"
        style={{ animationDuration: `${4 * BEAT}s` }}
      >
        <div className="absolute inset-x-[-20%] top-[44%] bottom-0 rounded-[50%] bg-[linear-gradient(#f4fbff,#cde6f6)]" />
        {BACK.map(([id, x], i) => (
          <Placed key={id} who={everyone[id]} x={x} y={47} s={0.42} delay={-((i * 0.37) % 1) * BEAT} />
        ))}
        <div className="absolute inset-x-0 top-[43%] h-[7%] bg-[linear-gradient(transparent,#f4fbff_55%,transparent)]" />
        <ShinjiAlone />
        <div className="absolute top-[70%] left-1/2 h-[9%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,#f4fbff,transparent)]" />
        {FRONT.map(([id, x], i) => (
          <Placed
            key={id}
            who={everyone[id]}
            x={x}
            y={id === "penpen" ? "calc(var(--front) - 4%)" : "var(--front)"}
            s={id === "penpen" ? 0.5 : 0.8}
            delay={-((i * 0.61) % 1) * BEAT}
          />
        ))}
        {glass && (
          <>
            <Shatter />
            <ShinjiAlone />
          </>
        )}
      </div>
    </div>
  );
}

function Caption({ big, small, className = "" }) {
  return (
    <div className={`absolute ${className}`}>
      <p
        className="font-title text-6xl leading-none font-black [-webkit-text-stroke:6px_#fff] [paint-order:stroke_fill] sm:text-8xl"
        style={{ color: INK }}
      >
        {big}
      </p>
      <p className="mt-4 text-xs tracking-[0.3em] sm:text-sm" style={{ color: INK }}>
        {small}
      </p>
    </div>
  );
}

// A close-up: one character, clapping on the beat, saying congratulations.
function Cut({ who, index }) {
  const left = index % 2 === 0;
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${left ? 34 : 66}% 60%, ${who.glow}66, transparent 42%), ${SKY}`,
      }}
    >
      <div className="absolute inset-0 animate-[cut-in_0.4s_ease-out_both]">
        <div
          className={`absolute bottom-[-6%] left-1/2 aspect-[200/240] h-[min(88vh,140vw)] -translate-x-1/2 ${
            left ? "sm:left-[32%]" : "sm:left-[68%]"
          }`}
        >
          <Bust who={who} className="h-full w-full" />
        </div>
      </div>
      <Caption
        big={who.penguin ? "クワッ！" : "おめでとう"}
        small={`${who.jp} // ${who.en}`}
        className={`inset-x-4 top-[8%] text-center sm:inset-x-auto sm:top-1/2 sm:w-[44%] sm:-translate-y-1/2 ${
          left ? "sm:right-[3%]" : "sm:left-[3%]"
        }`}
      />
    </div>
  );
}

function Parents() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: SKY }}>
      <div className="absolute inset-0 animate-[cut-in_0.4s_ease-out_both]">
        {PARENTS.map((who, i) => (
          <div
            key={who.id}
            className="absolute bottom-[-6%] aspect-[200/240] h-[min(74vh,80vw)] -translate-x-1/2"
            style={{ left: `${i ? 66 : 34}%` }}
          >
            <Bust who={who} className="h-full w-full" />
          </div>
        ))}
      </div>
      <Caption
        big="おめでとう"
        small={`${PARENTS.map((p) => p.jp).join(" · ")} // GENDO & YUI IKARI`}
        className="inset-x-4 top-[7%] text-center"
      />
    </div>
  );
}

function Thanks({ fading }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(#8fd0ff,#e8f7ff_55%,#fff)]">
      <div className="absolute inset-0 animate-[cut-in_0.6s_ease-out_both]">
        <div className="absolute bottom-[-6%] left-1/2 aspect-[200/240] h-[min(84vh,140vw)] -translate-x-1/2">
          <Bust who={SHINJI} hands={false} smile className="h-full w-full" />
        </div>
      </div>
      <Caption big="ありがとう" small="THANK YOU" className="inset-x-4 top-[7%] text-center" />
      {fading && (
        <div
          className="absolute inset-0 animate-[fade-in_ease-in_both] bg-black"
          style={{ animationDuration: `${4 * BEAT}s` }}
        />
      )}
    </div>
  );
}

export default function Congratulations({ onDone }) {
  const [shot, setShot] = useState({ name: "void" });
  const done = useLatest(onDone);

  useEffect(() => {
    let stopApplause = () => {};
    const timers = SHOTS.map(([seconds, next]) =>
      setTimeout(() => {
        setShot(next);
        if (next.name === "crack") sfx.creak();
        if (next.name === "circle") sfx.shatter();
        if (next.name === "cut" || next.name === "parents") sfx.clap();
      }, seconds * 1000),
    );
    // The crowd applauds from just after the glass breaks until Shinji has said thank you.
    timers.push(setTimeout(() => (stopApplause = startApplause(at(27) - SHATTER_AT)), SHATTER_AT * 1000 + 300));
    timers.push(setTimeout(() => done.current(), SCENE_SECONDS * 1000));
    return () => {
      timers.forEach(clearTimeout);
      stopApplause();
    };
  }, [done]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ "--beat": `${BEAT}s` }} aria-live="polite">
      <p className="sr-only">
        {shot.name === "void" || shot.name === "crack"
          ? "Shinji, alone in the dark: I can stay here."
          : shot.name === "thanks" || shot.name === "fade"
            ? "Shinji: thank you."
            : "Everyone is applauding you. Congratulations."}
      </p>
      {(shot.name === "void" || shot.name === "crack") && <Void cracking={shot.name === "crack"} />}
      {shot.name === "circle" && <Circle />}
      {shot.name === "cut" && <Cut key={shot.index} who={CAST[shot.index]} index={shot.index} />}
      {shot.name === "parents" && <Parents />}
      {(shot.name === "thanks" || shot.name === "fade") && <Thanks fading={shot.name === "fade"} />}
    </div>
  );
}
