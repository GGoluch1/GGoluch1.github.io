import { useEffect, useState } from "react";
import { profile } from "../data/profile";
import { socials } from "../data/socials";
import { sfx } from "../lib/sound";
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
    setVotes(0);
    setRun((r) => r + 1);
  };

  const approved = (id) => VOTE_ORDER.indexOf(id) < votes;
  const done = votes === VOTE_ORDER.length;

  return (
    <section id="magi" tabIndex={-1} className="hex-grid scroll-mt-16 outline-none border-b-2 border-magi/40">
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
            <p className="mt-6 inline-block bg-nerv px-2 py-0.5 text-sm tracking-widest text-void">
              {profile.designation}
            </p>
            <p className="mt-6 max-w-md text-paper/75">{profile.tagline}</p>
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
            className="w-[80%] shrink-0 snap-start sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.75rem)]"
          />

          {/* Connector: Balthasar ─ MAGI ─ Casper/Melchior */}
          <div className="hidden sm:col-span-2 sm:block" aria-hidden="true">
            <div className="mx-auto h-5 w-0.5 bg-magi/60" />
            <div
              className={`mx-auto w-fit border-2 px-3 font-title text-lg font-black tracking-[0.4em] glow transition-colors duration-500 ${
                done ? "border-sync text-sync" : "border-magi/60 text-magi"
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
            className="w-[80%] shrink-0 snap-start sm:w-auto"
          />
          <MagiPanel
            name="MELCHIOR"
            number={1}
            data={profile.magi.melchior}
            approved={approved("melchior")}
            className="w-[80%] shrink-0 snap-start sm:w-auto"
          />
          </div>
          <p className="mt-2 text-center text-[10px] tracking-[0.3em] text-magi/80 sm:hidden" aria-hidden="true">
            ◂ SWIPE ▸
          </p>

          <div
            className={`mt-6 flex border-2 text-sm transition-colors duration-500 ${done ? "border-sync" : "border-magi"}`}
            aria-live="polite"
          >
            <span
              className={`px-3 py-2 font-title font-black text-void transition-colors duration-500 ${
                done ? "bg-sync" : "bg-magi"
              }`}
            >
              決議
            </span>
            <div className="flex flex-1 items-center justify-between gap-2 px-3">
              {done ? (
                <span className="animate-stamp text-sync glow">承認 // ACCESS GRANTED</span>
              ) : (
                <span className="animate-blink">DELIBERATING… {votes}/3</span>
              )}
              <button
                type="button"
                onClick={rerun}
                className="group/re flex items-center gap-1 text-xs text-magi/80 transition-colors hover:text-magi"
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
