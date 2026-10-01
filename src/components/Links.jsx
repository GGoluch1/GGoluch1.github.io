import { site } from "../data/site";
import { socials } from "../data/socials";
import Reveal from "./Reveal";
import TitleCard from "./TitleCard";

function ChannelRow({ code, name, detail, action, hoverAction, arrow = "▸", ...linkProps }) {
  return (
    <a
      {...linkProps}
      className="wipe-fill group flex items-center gap-4 px-3 py-3 transition-colors duration-300 hover:text-void focus-visible:text-void"
    >
      <span className="text-xs text-magi/80 transition-colors group-hover:text-void">{code}</span>
      <span className="font-title text-lg font-black text-paper transition duration-300 group-hover:translate-x-1 group-hover:text-void">
        {name}
      </span>
      <span className="hidden flex-1 origin-left border-b border-dotted border-current opacity-30 transition-transform duration-500 group-hover:scale-x-95 sm:block" />
      <span className="hidden text-sm sm:inline">{detail}</span>
      <span className="ml-auto flex items-center gap-1 text-xs text-sync transition-colors group-hover:text-void sm:ml-0">
        <span className="hidden group-hover:inline">{hoverAction}</span>
        <span className="group-hover:hidden">{action}</span>
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">{arrow}</span>
      </span>
    </a>
  );
}

export default function Links() {
  const channels = socials.length + (site.resume ? 1 : 0);

  return (
    <section id="comms" className="scroll-mt-14">
      <TitleCard episode="03" title="COMMUNICATION CHANNELS" jp="通信回線 // ALL CHANNELS OPEN" />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Reveal>
          <div className="border-2 border-magi">
            <div className="flex justify-between bg-magi px-3 py-1 text-sm text-void">
              <span>NERV COMMS TERMINAL</span>
              <span>{channels} CH OPEN</span>
            </div>
            <ul className="divide-y divide-magi/30">
              {site.resume && (
                <li>
                  <Reveal variant="wipe" delay={150}>
                    <ChannelRow
                      href={site.resume}
                      download
                      data-goatcounter-click="resume-download"
                      code="DOC-00"
                      name="PERSONNEL DOSSIER"
                      detail="résumé.pdf"
                      action="DOWNLOAD"
                      hoverAction="RETRIEVING"
                      arrow="▾"
                    />
                  </Reveal>
                </li>
              )}
              {socials.map((s, i) => (
                <li key={s.name}>
                  <Reveal variant="wipe" delay={240 + i * 90}>
                    <ChannelRow
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      data-goatcounter-click={`social-${s.name.toLowerCase()}`}
                      code={`CH-${String(i + 1).padStart(2, "0")}`}
                      name={s.name}
                      detail={s.handle}
                      action="CONNECT"
                      hoverAction="LINKING"
                    />
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
