import { useEffect, useRef, useState } from "react";
import { profile } from "../data/profile";
import { socials } from "../data/socials";
import { find } from "../lib/eggs";
import { sfx } from "../lib/sound";
import { onUi } from "../lib/ui";
import GendoDialog from "./eggs/GendoDialog";
import Ramiel from "./eggs/Ramiel";
import MagiPanel from "./MagiPanel";

// Order the three computers cast their votes in.
const VOTE_ORDER = ["balthasar", "casper", "melchior"];

// Splits a word into letters that slide in once, then hop on hover.
function Letters({ text, active, offset = 0 }) {
  return [...text].map((ch, i) => (
    <span
      key={i}
      aria-hidden="true"
      className={`inline-block transition-[translate,color] duration-200 hover:-translate-y-2 hover:text-nerv ${
        active ? "animate-letter-in" : "opacity-0"
      }`}
      style={{ animationDelay: `${(offset + i) * 45}ms` }}
    >
      {ch}
    </span>
  ));
}

// Seal 3: re-run the vote three times and the Angel Iruel gets into the MAGI.
// Melchior proposes self-destruct, Balthasar agrees, and Casper's veto saves
// NERV, as in episode 13. Each step is [ms from start, state].
const IRUEL = [
  [0, { stage: 1, text: "ANGEL DETECTED INSIDE MAGI // IRUEL" }],
  [800, { stage: 2, text: "MELCHIOR-1 HACKED // PROPOSES SELF-DESTRUCT" }],
  [1600, { stage: 3, text: "BALTHASAR-2 HACKED // 2 OF 3 IN FAVOR" }],
  ...[9, 8, 7, 6, 5, 4, 3].map((n, i) => [2300 + i * 330, { stage: 4, text: `MAGI SELF-DESTRUCT IN 00:0${n}` }]),
  [4700, { stage: 5, text: "CASPER-3 VETOES // 否決" }],
  [6000, { stage: 6, text: "SELF-DESTRUCT CANCELLED // 自律自爆 解除" }],
  [8200, null],
];

function iruelOverride(id, stage) {
  if (stage >= 6) return { tone: "green", stamp: "解除" };
  if (id === "melchior" && stage >= 2) return { tone: "red", stamp: "自爆" };
  if (id === "balthasar" && stage >= 3) return { tone: "red", stamp: "可決" };
  if (id === "casper" && stage >= 5) return { tone: "green", stamp: "否決" };
  return { tone: id === "casper" ? "amber" : "red", stamp: "審議中" };
}

// Fades a block in after the boot screen, with a stagger.
function enter(active, delay) {
  return {
    className: `transition-[opacity,translate] duration-700 ${
      active ? "opacity-100" : "translate-y-4 opacity-0"
    }`,
    style: { transitionDelay: `${delay}ms` },
  };
}

export default function Hero({ active }) {
  const [votes, setVotes] = useState(0);
  const [run, setRun] = useState(0);
  const [gendo, setGendo] = useState(false);
  const [iruel, setIruel] = useState(null);
  const [iruelRun, setIruelRun] = useState(0);
  const reruns = useRef(0);

  useEffect(() => onUi("gendo", () => setGendo(true)), []);

  useEffect(() => {
    if (!iruelRun) return;
    const timers = IRUEL.map(([ms, next]) =>
      setTimeout(() => {
        setIruel(next);
        if (next?.stage === 1 || next?.stage === 4) sfx.alarm();
        if (next?.stage === 6) {
          sfx.granted();
          find("iruel");
        }
      }, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [iruelRun]);

  // Once the site is visible, the MAGI vote one after another.
  useEffect(() => {
    if (!active) return;
    const timers = VOTE_ORDER.map((_, i) =>
      setTimeout(() => {
        setVotes(i + 1);
        if (i === VOTE_ORDER.length - 1) sfx.granted();
        else sfx.approve();
      }, 900 + 700 * i),
    );
    return () => timers.forEach(clearTimeout);
  }, [run, active]);

  const rerun = () => {
    if (iruel) return;
    reruns.current += 1;
    if (reruns.current % 3 === 0) {
      setIruelRun((n) => n + 1);
      return;
    }
    setVotes(0);
    setRun((r) => r + 1);
  };

  const approved = (id) => VOTE_ORDER.indexOf(id) < votes;
  const override = (id) => (iruel ? iruelOverride(id, iruel.stage) : undefined);
  const done = votes === VOTE_ORDER.length;
  const alert = iruel && iruel.stage < 6;

  return (
    <section id="magi" tabIndex={-1} className="hex-grid relative isolate scroll-mt-16 overflow-hidden outline-none border-b-2 border-magi/40">
      {/* Tokyo-3 sky: a sunset tint at dusk, a moon at night (see src/lib/tod.js) */}
      <div className="tod-sky pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="tod-moon pointer-events-none absolute top-4 right-4 -z-10 size-10 rounded-full bg-paper/75 shadow-[0_0_60px_18px_rgb(169_200_255/0.25)] sm:top-8 sm:right-[8%] sm:size-16"
        aria-hidden="true"
      />
      <Ramiel className="right-2 bottom-2 sm:right-[4%] sm:bottom-4" />
      <GendoDialog open={gendo} onClose={() => setGendo(false)} />
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-10 sm:gap-12 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:py-24">
        {/* Left: personnel file */}
        <div>
          <p {...enter(active, 0)}>
            <span className="text-xs tracking-[0.3em] text-magi/80">特務機関ネルフ // PERSONNEL FILE</span>
          </p>
          <h1
            aria-label={`${profile.firstName} ${profile.lastName}`}
            className="mt-4 font-title text-6xl leading-[0.85] font-black tracking-tight text-paper sm:text-8xl"
          >
            <Letters text={profile.firstName} active={active} />
            <br />
            <span className="text-magi">
              <Letters text={profile.lastName} active={active} offset={profile.firstName.length} />
            </span>
          </h1>
          <div {...enter(active, 500)}>
            <button
              type="button"
              onClick={() => setGendo(true)}
              className="mt-6 inline-block bg-nerv px-2 py-0.5 text-left text-sm tracking-widest text-void transition hover:shadow-[3px_3px_0_var(--color-paper)]"
            >
              {profile.designation}
            </button>
            <p className="mt-6 max-w-md text-paper">{profile.about}</p>
            <p className="mt-3 max-w-md text-paper/75">{profile.tagline}</p>
          </div>

          <div {...enter(active, 700)}>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#files"
                className="sheen bg-magi px-5 py-2.5 font-bold text-void shadow-[4px_4px_0_var(--color-nerv)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-nerv)] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                ACCESS ▸ CASE FILES
              </a>
              <a
                href="#comms"
                className="wipe-fill border-2 border-magi px-5 py-2 transition-colors duration-300 hover:text-void active:scale-95"
              >
                OPEN COMMS
              </a>
            </div>
          </div>

          {/* Quick links to socials, so phones don't have to scroll to the comms section */}
          <div {...enter(active, 850)}>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="w-full tracking-[0.3em] text-magi/80 sm:mr-1 sm:w-auto">QUICK COMMS //</span>
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  data-goatcounter-click={`hero-${s.name.toLowerCase()}`}
                  className="wipe-fill flex min-h-11 items-center border border-magi/60 px-3 tracking-widest transition-colors duration-300 hover:text-void focus-visible:text-void"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right: MAGI deliberation */}
        <div {...enter(active, 300)}>
          <div className="mb-4 flex justify-between text-[11px] tracking-widest text-magi/80">
            <span>提訴 // CODE:473</span>
            <span>EXTENSION:3023</span>
            <span>PRIORITY:AAA</span>
          </div>

          {/* Phones: a swipeable row of panels. Larger screens: the classic MAGI triangle. */}
          <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-0 sm:overflow-visible sm:p-0">
          <MagiPanel
            name="BALTHASAR"
            number={2}
            data={profile.magi.balthasar}
            approved={approved("balthasar")}
            override={override("balthasar")}
            className="w-[80%] shrink-0 snap-start sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.75rem)]"
          />

          {/* Connector: Balthasar ─ MAGI ─ Casper/Melchior */}
          <div className="hidden sm:col-span-2 sm:block" aria-hidden="true">
            <div className="mx-auto h-5 w-0.5 bg-magi/60" />
            <div
              className={`mx-auto w-fit border-2 px-3 font-title text-lg font-black tracking-[0.4em] glow transition-colors duration-500 ${
                alert ? "border-nerv text-nerv" : done ? "border-sync text-sync" : "border-magi/60 text-magi"
              }`}
            >
              MAGI
            </div>
            <div className="mx-auto h-5 w-[calc(50%+0.75rem)] border-x-2 border-t-2 border-magi/60" />
          </div>

          <MagiPanel
            name="CASPER"
            number={3}
            data={profile.magi.casper}
            approved={approved("casper")}
            override={override("casper")}
            className="w-[80%] shrink-0 snap-start sm:w-auto"
          />
          <MagiPanel
            name="MELCHIOR"
            number={1}
            data={profile.magi.melchior}
            approved={approved("melchior")}
            override={override("melchior")}
            className="w-[80%] shrink-0 snap-start sm:w-auto"
          />
          </div>
          <p className="mt-2 text-center text-[10px] tracking-[0.3em] text-magi/80 sm:hidden" aria-hidden="true">
            ◂ SWIPE ▸
          </p>

          <div
            className={`mt-6 flex border-2 text-sm transition-colors duration-500 ${
              alert ? "border-nerv" : done ? "border-sync" : "border-magi"
            }`}
            aria-live="polite"
          >
            <span
              className={`px-3 py-2 font-title font-black text-void transition-colors duration-500 ${
                alert ? "bg-nerv" : done ? "bg-sync" : "bg-magi"
              }`}
            >
              {alert ? "警告" : "決議"}
            </span>
            <div className="flex flex-1 items-center justify-between gap-2 px-3">
              {iruel ? (
                <span key={iruel.text} className={`animate-line-in ${alert ? "text-nerv" : "text-sync glow"}`}>
                  {iruel.text}
                </span>
              ) : done ? (
                <span className="animate-stamp text-sync glow">承認 // ACCESS GRANTED</span>
              ) : (
                <span className="animate-blink">DELIBERATING… {votes}/3</span>
              )}
              <button
                type="button"
                onClick={rerun}
                disabled={Boolean(iruel)}
                className="group/re shrink-0 flex items-center gap-1 text-xs text-magi/80 transition-colors hover:text-magi"
              >
                <span className="inline-block transition-transform duration-500 group-hover/re:-rotate-180">↻</span>
                RE-RUN
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
