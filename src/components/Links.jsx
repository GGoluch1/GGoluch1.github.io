import { socials } from "../data/socials";
import Reveal from "./Reveal";
import TitleCard from "./TitleCard";

export default function Links() {
  return (
    <section id="comms" className="scroll-mt-14">
      <TitleCard episode="03" title="COMMUNICATION CHANNELS" jp="通信回線 // ALL CHANNELS OPEN" />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Reveal>
          <div className="border-2 border-magi">
            <div className="flex justify-between bg-magi px-3 py-1 text-sm text-void">
              <span>NERV COMMS TERMINAL</span>
              <span>{socials.length} CH OPEN</span>
            </div>
            <ul className="divide-y divide-magi/30">
              {socials.map((s, i) => (
                <li key={s.name}>
                  <Reveal variant="wipe" delay={150 + i * 90}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="wipe-fill group flex items-center gap-4 px-3 py-3 transition-colors duration-300 hover:text-void focus-visible:text-void"
                    >
                      <span className="text-xs opacity-50 transition-opacity group-hover:opacity-100">
                        CH-{String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-title text-lg font-black text-paper transition duration-300 group-hover:translate-x-1 group-hover:text-void">
                        {s.name}
                      </span>
                      <span className="hidden flex-1 origin-left border-b border-dotted border-current opacity-30 transition-transform duration-500 group-hover:scale-x-95 sm:block" />
                      <span className="hidden text-sm sm:inline">{s.handle}</span>
                      <span className="ml-auto flex items-center gap-1 text-xs text-sync transition-colors group-hover:text-void sm:ml-0">
                        <span className="hidden group-hover:inline">LINKING</span>
                        <span className="group-hover:hidden">CONNECT</span>
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">▸</span>
                      </span>
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
