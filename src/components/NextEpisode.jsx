import { briefing } from "../data/briefing";
import Reveal from "./Reveal";

// 次回予告: Evangelion's "next episode" preview, teasing what's coming
// (briefing.next). Misato always signs off the same way.
export default function NextEpisode() {
  const next = briefing.next;
  if (!next) return null;

  return (
    <Reveal variant="wipe" className="mb-12 print:hidden">
      <div className="grid gap-4 border-y-2 border-paper/20 bg-black px-4 py-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:px-6">
        <div>
          <p className="font-title text-4xl leading-none font-black text-paper sm:text-5xl">次回予告</p>
          <p className="mt-2 text-[11px] tracking-[0.4em] text-paper/60">NEXT EPISODE</p>
        </div>
        <div>
          <p className="font-title text-xl font-black text-paper sm:text-2xl">{next.title}</p>
          <p className="mt-2 max-w-xl text-sm text-paper/75">{next.teaser}</p>
          <p className="mt-3 font-title text-lg font-black text-magi">
            サービス、サービス！{" "}
            <span className="font-mono text-xs font-normal tracking-widest text-magi/80">SERVICE, SERVICE!</span>
          </p>
        </div>
      </div>
    </Reveal>
  );
}
