import { projects } from "../data/projects";
import Briefing from "./Briefing";
import CaseFileCard from "./CaseFileCard";
import Reveal from "./Reveal";
import TitleCard from "./TitleCard";

export default function CaseFiles() {
  return (
    <section id="files" tabIndex={-1} className="scroll-mt-14 outline-none">
      <TitleCard episode="02" title="NERV CASE FILES" jp="特務機関ネルフ 機密文書 // CLASSIFIED ARCHIVE" />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Briefing />
        <Reveal variant="wipe">
          <p className="mb-8 text-sm text-magi/80">
            &gt; QUERY CASE_FILES // {projects.length} RECORDS FOUND // HOVER OR TAP TO DECLASSIFY
          </p>
        </Reveal>
        <div className="grid gap-x-6 gap-y-14 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.file} delay={(i % 3) * 120} className="h-full">
              <CaseFileCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
