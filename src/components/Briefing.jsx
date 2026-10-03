import { briefing } from "../data/briefing";
import { profile } from "../data/profile";
import { dotDate } from "../lib/format";
import ActivityLog from "./ActivityLog";
import NextEpisode from "./NextEpisode";
import Reveal from "./Reveal";

// "What I'm doing now", written up as a NERV operations order, with the
// latest commits under it and a "next episode" preview after it.

const STATUS = {
  ACTIVE: ["text-sync", "● IN PROGRESS", true],
  STANDBY: ["text-amber", "◐ STANDBY", false],
  COMPLETE: ["text-magi/80", "✓ COMPLETE", false],
};

export default function Briefing() {
  return (
    <>
      <Reveal className="mb-12">
        <div className="border-2 border-magi">
          <div className="flex flex-wrap justify-between gap-x-4 bg-magi px-3 py-1 text-sm text-void">
            <span>作戦概要 // MISSION BRIEFING</span>
            <span>UPDATED {dotDate(briefing.updated)}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-magi/30 px-3 py-2 text-[11px] tracking-widest text-magi/80">
            <span>ASSIGNED // {profile.child}</span>
            <span>
              {briefing.tasks.filter((t) => t.status === "ACTIVE").length} ACTIVE // {briefing.tasks.length} TOTAL
            </span>
          </div>
          <ol className="divide-y divide-magi/30">
            {briefing.tasks.map((task, i) => {
              const [tone, label, blink] = STATUS[task.status] ?? STATUS.STANDBY;
              return (
                <li key={task.name} className="flex items-center gap-4 px-3 py-3">
                  <span className="text-xs text-magi/80">OP-{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-title text-lg font-black text-paper uppercase">{task.name}</span>
                  <span className={`text-xs tracking-widest ${tone} ${blink ? "animate-blink" : ""}`}>{label}</span>
                </li>
              );
            })}
          </ol>
          <ActivityLog />
        </div>
      </Reveal>
      <NextEpisode />
    </>
  );
}
