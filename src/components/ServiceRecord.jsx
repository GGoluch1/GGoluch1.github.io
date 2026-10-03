import { record } from "../data/record";
import Reveal from "./Reveal";

// Pilot service record: education, jobs and clubs (src/data/record.js),
// as a NERV personnel history.
const STATUS = {
  ACTIVE: ["text-sync", "● ACTIVE"],
  COMPLETE: ["text-magi/80", "✓ COMPLETE"],
};

export default function ServiceRecord() {
  if (!record.length) return null;

  return (
    <Reveal className="mt-20">
      <div className="border-2 border-magi">
        <div className="flex flex-wrap justify-between gap-x-4 bg-magi px-3 py-1 text-sm text-void">
          <span>服務記録 // PILOT SERVICE RECORD</span>
          <span>{record.length} ENTRIES</span>
        </div>
        <ol className="divide-y divide-magi/30">
          {record.map((entry) => {
            const [tone, label] = STATUS[entry.status] ?? STATUS.COMPLETE;
            return (
              <li
                key={`${entry.org}-${entry.role}`}
                className="grid gap-x-6 gap-y-1 px-3 py-4 sm:grid-cols-[9rem_1fr_auto]"
              >
                <span className="text-xs tracking-widest text-magi/80 tabular-nums">{entry.period}</span>
                <div>
                  <p className="font-title text-lg font-black text-paper">{entry.org}</p>
                  <p className="text-sm text-paper/80">{entry.role}</p>
                  {entry.detail && <p className="mt-1 text-xs text-paper/60">{entry.detail}</p>}
                </div>
                <span className={`text-xs tracking-widest ${tone}`}>{label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </Reveal>
  );
}
