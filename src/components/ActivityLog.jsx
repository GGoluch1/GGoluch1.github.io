import { useRemote } from "../hooks/useRemote";
import { dotDate } from "../lib/format";
import { fetchActivity } from "../lib/remote";

// The MAGI activity log: the latest public commits from GitHub (site.github),
// so the briefing shows real work without anyone editing it. Hidden until the
// data arrives, and when GitHub can't be reached.
export default function ActivityLog() {
  const commits = useRemote(fetchActivity, "activity");
  if (!commits?.length) return null;

  return (
    <div className="animate-line-in border-t-2 border-magi/60">
      <div className="flex justify-between px-3 pt-2 text-[11px] tracking-widest text-magi/80">
        <span>活動記録 // MAGI ACTIVITY LOG</span>
        <span className="hidden sm:inline">SOURCE // GITHUB</span>
      </div>
      <ol className="px-3 py-2 text-xs">
        {commits.map((c) => (
          <li key={c.sha} className="flex gap-3 py-1">
            <span className="shrink-0 text-magi/80 tabular-nums">{dotDate(c.date)}</span>
            <a
              href={`https://github.com/${c.repo}/commit/${c.sha}`}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate text-paper/85 transition-colors hover:text-paper"
              title={c.message}
            >
              {c.message}
            </a>
            <span className="hidden shrink-0 text-cyan sm:inline">{c.repo.split("/")[1]}</span>
            <span className="shrink-0 text-magi/80">{c.sha}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
