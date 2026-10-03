import { useState } from "react";
import { useInView } from "../hooks/useInView";
import { useRemote } from "../hooks/useRemote";
import { relative } from "../lib/format";
import { fetchRepo } from "../lib/remote";
import { reportPath } from "../lib/routes";

const STATUS = {
  OPEN: "text-sync",
  "UNDER REVIEW": "text-amber",
  CLOSED: "text-nerv",
};

// Renders [[redacted]] segments as black bars that clear on hover, focus,
// or when the card is "declassified" (tapped / toggled).
function Redactable({ text }) {
  return text.split(/(\[\[.+?\]\])/g).map((part, i) =>
    part.startsWith("[[") ? (
      <span
        key={i}
        className="bg-paper/90 text-transparent transition-colors duration-300 group-focus-within:bg-transparent group-focus-within:text-sync group-hover:bg-transparent group-hover:text-sync group-data-open:bg-transparent group-data-open:text-sync"
      >
        {part.slice(2, -2)}
      </span>
    ) : (
      part
    ),
  );
}

// Links out open in a new tab; the incident report is part of this site.
function FileLink({ href, external = true, children }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group/link flex items-center gap-1 transition-colors hover:text-paper"
    >
      [{children}
      <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-1">▸</span>]
    </a>
  );
}

export default function CaseFileCard({ project }) {
  const { file, title, blurb, tags, status, progress, year, image, repo, live, github, report } = project;
  const [ref, inView] = useInView(0.4);
  const stats = useRemote(() => fetchRepo(github), github);
  const pct = Math.min(Math.max(progress, 0), 100);
  const [open, setOpen] = useState(false);

  // Touch screens have no hover, so tapping the card toggles the declassified state.
  // Taps on links inside the card just follow the link.
  const onCardClick = (e) => {
    if (e.target.closest("a, button")) return;
    setOpen((o) => !o);
  };

  return (
    <article
      ref={ref}
      data-open={open || undefined}
      onClick={onCardClick}
      className="group @container relative flex h-full cursor-pointer flex-col border-2 border-magi/50 bg-panel transition duration-300 focus-within:border-magi hover:-translate-y-1.5 hover:-rotate-[0.5deg] hover:border-magi hover:shadow-[8px_8px_0_var(--color-nerv)] data-open:-translate-y-1.5 data-open:border-magi data-open:shadow-[8px_8px_0_var(--color-nerv)]"
    >
      {/* Folder tab */}
      <div className="absolute -top-7 -left-0.5 flex h-7 items-center border-2 border-b-0 border-magi/50 bg-panel px-3 text-[11px] tracking-widest transition duration-300 group-hover:-translate-y-1 group-hover:border-magi group-hover:bg-magi group-hover:text-void group-data-open:-translate-y-1 group-data-open:border-magi group-data-open:bg-magi group-data-open:text-void">
        CASE No.{file}
      </div>

      <div className="flex items-center justify-between border-b border-magi/30 px-4 py-2 text-[10px] tracking-[0.25em] text-magi/80">
        <span className="min-w-0 truncate">
          {/* Only on cards wide enough for it (a container query on the card, not the screen) */}
          <span className="hidden @md:inline">特務機関ネルフ // </span>CASE FILE // {year}
        </span>
        <button
          type="button"
          aria-pressed={open}
          onClick={() => setOpen((o) => !o)}
          className="relative -my-1 shrink-0 px-1.5 py-1 whitespace-nowrap text-magi transition-colors before:absolute before:inset-x-0 before:-inset-y-2.5 hover:bg-magi hover:text-void print:hidden"
        >
          {open ? "▾ RECLASSIFY" : "▸ DECLASSIFY"}
        </button>
      </div>

      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-video w-full object-cover opacity-80 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0 group-data-open:opacity-100 group-data-open:grayscale-0"
        />
      )}

      <div className="relative flex flex-1 flex-col gap-4 overflow-hidden p-4">
        {/* "Classified" stamp that slams in on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 bottom-20 scale-150 rotate-[-14deg] border-[3px] border-nerv px-2 py-0.5 font-title text-sm font-black tracking-widest text-nerv opacity-0 transition duration-200 ease-[cubic-bezier(0.3,1.6,0.5,1)] group-hover:scale-100 group-hover:opacity-90 group-data-open:scale-100 group-data-open:opacity-90 print:hidden"
        >
          機密 CLASSIFIED
        </span>

        <h3 className="font-title text-2xl font-black text-paper">{title}</h3>
        <p className="text-sm text-paper/70">
          <Redactable text={blurb} />
        </p>

        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <li
              key={tag}
              className="border border-magi/50 px-1.5 text-[11px] transition duration-300 group-hover:-translate-y-0.5 group-hover:border-magi group-data-open:-translate-y-0.5 group-data-open:border-magi"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {tag}
            </li>
          ))}
        </ul>

        {stats && (
          <p className="animate-line-in text-[11px] tracking-widest text-cyan">
            &gt; UPLINK // LAST PUSH {relative(stats.pushedAt).toUpperCase()} // ★ {stats.stars}
            {stats.language && ` // ${stats.language.toUpperCase()}`}
          </p>
        )}

        <div className="mt-auto print:hidden">
          <div className="flex justify-between text-[11px] tracking-widest">
            <span>DOSSIER COMPLETION</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden border border-magi/40 bg-void">
            <div
              className="h-full origin-left bg-magi transition-transform delay-300 duration-1000 ease-out"
              style={{ transform: `scaleX(${inView ? pct / 100 : 0})` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-magi/30 pt-3 text-xs">
          <span className={STATUS[status] ?? "text-magi"}>● {status}</span>
          <div className="flex gap-3">
            {report && (
              <FileLink href={reportPath(project)} external={false}>
                REPORT
              </FileLink>
            )}
            {repo && <FileLink href={repo}>SOURCE</FileLink>}
            {live && <FileLink href={live}>DEPLOY</FileLink>}
          </div>
        </div>
      </div>
    </article>
  );
}
