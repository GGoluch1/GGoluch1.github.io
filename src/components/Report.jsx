import { useEffect } from "react";
import { profile } from "../data/profile";
import { useRemote } from "../hooks/useRemote";
import { BOOTED_KEY, SECTION_KEY } from "../lib/boot";
import { relative } from "../lib/format";
import { fetchRepo } from "../lib/remote";
import { session } from "../lib/storage";
import ATField from "./ATField";

// An incident report: the long write-up of one case file, on its own page
// at /files/<slug>/ (see src/lib/routes.js). Prerendered like the home page.

const STATUS = {
  OPEN: "text-sync",
  "UNDER REVIEW": "text-amber",
  CLOSED: "text-nerv",
};

const YEAR = new Date().getFullYear();

// Back to the case files: the home page opens there once (see SECTION_KEY).
// Without JavaScript the #files anchor does the same.
const backToFiles = () => session.set(SECTION_KEY, "files");

const plain = (text) => text.replace(/\[\[(.+?)\]\]/g, "$1");

function Section({ jp, en, children }) {
  return (
    <section className="border-t border-magi/30 py-8">
      <h2 className="text-xs tracking-[0.3em] text-magi/80">
        {jp} // {en}
      </h2>
      <div className="mt-3 text-paper/85">{children}</div>
    </section>
  );
}

function OutLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="wipe-fill border-2 border-magi px-4 py-2 text-sm tracking-[0.2em] transition-colors duration-300 hover:text-void focus-visible:text-void"
    >
      {children} ▸
    </a>
  );
}

export default function Report({ project }) {
  const { file, title, blurb, tags, status, year, image, repo, live, github, report } = project;
  const stats = useRemote(() => fetchRepo(github), github);

  // Coming back to the case files from here skips the boot sequence.
  useEffect(() => {
    session.set(BOOTED_KEY, "1");
  }, []);

  return (
    <>
      <a
        href="#report"
        className="sr-only z-[80] bg-magi px-4 py-2 font-bold text-void focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        SKIP TO CONTENT
      </a>
      <header className="sticky top-0 z-40 border-b-2 border-magi bg-void/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-2">
          <a href="/" className="flex items-baseline gap-2">
            <span className="font-title text-2xl font-black tracking-tight text-nerv">NERV</span>
            <span className="hidden text-xs tracking-[0.3em] text-magi/80 sm:inline">MAGI SYSTEM</span>
          </a>
          <a
            href="/#files"
            onClick={backToFiles}
            className="text-sm tracking-widest transition-colors hover:text-paper"
          >
            ◂ CASE FILES
          </a>
        </div>
      </header>

      <main id="report" tabIndex={-1} className="outline-none">
        <div className="hex-grid relative border-b-2 border-magi/40">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
            <p className="text-xs tracking-[0.3em] text-magi/80">特務機関ネルフ // INCIDENT REPORT // CASE No.{file}</p>
            <h1 className="mt-4 font-title text-5xl leading-[0.9] font-black tracking-tight text-paper sm:text-7xl">
              {title}
            </h1>
            <p className="mt-4 text-sm tracking-widest">
              {year} // <span className={STATUS[status] ?? "text-magi"}>● {status}</span>
            </p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li key={tag} className="border border-magi/50 px-1.5 text-[11px]">
                  {tag}
                </li>
              ))}
            </ul>
            {stats && (
              <p className="mt-4 animate-line-in text-[11px] tracking-widest text-cyan">
                &gt; UPLINK // LAST PUSH {relative(stats.pushedAt).toUpperCase()} // ★ {stats.stars}
                {stats.language && ` // ${stats.language.toUpperCase()}`}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10">
          {image && <img src={image} alt={`Screenshot of ${title}`} className="mb-10 w-full border-2 border-magi/50" />}
          <Section jp="概要" en="SUMMARY">
            <p>{plain(blurb)}</p>
          </Section>
          <Section jp="問題" en="PROBLEM">
            <p>{report.problem}</p>
          </Section>
          <Section jp="対処" en="APPROACH">
            <ol className="space-y-2">
              {report.approach.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="shrink-0 text-xs text-magi/80 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Section>
          <Section jp="結果" en="RESULT">
            <p>{report.result}</p>
          </Section>
          {(repo || live) && (
            <div className="flex flex-wrap gap-3 border-t border-magi/30 pt-8">
              {repo && <OutLink href={repo}>SOURCE</OutLink>}
              {live && <OutLink href={live}>DEPLOY</OutLink>}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t-2 border-magi/40">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center">
          <a
            href="/#files"
            onClick={backToFiles}
            className="text-sm tracking-widest transition-colors hover:text-paper print:hidden"
          >
            ◂ BACK TO THE CASE FILES
          </a>
          <p className="mt-6 text-xs text-magi/80">
            © {YEAR} {profile.firstName} {profile.lastName} // NERV HQ, TOKYO-3
          </p>
          <p className="mt-2 text-[10px] text-magi/80">
            Fan-made tribute. Neon Genesis Evangelion belongs to its respective owners.
          </p>
        </div>
      </footer>

      <ATField />
      <div className="pointer-events-none fixed inset-0 z-[70] crt print:hidden" aria-hidden="true" />
    </>
  );
}
