import { useInView } from "../hooks/useInView";

// Section divider styled after Evangelion's episode title cards:
// heavy white serif on pure black. The title wipes in when scrolled to.
export default function TitleCard({ episode, title, jp }) {
  const [ref, inView] = useInView(0.3);

  return (
    <div ref={ref} className="animate-flicker border-y border-magi/30 bg-black px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <p
          className={`font-title text-xl font-bold text-paper transition-opacity duration-500 ${
            inView ? "opacity-100" : "opacity-0"
          }`}
        >
          EPISODE:{episode}
        </p>
        <h2
          className={`mt-2 w-fit max-w-full font-title text-[clamp(1.75rem,9vw,4.5rem)] leading-[0.9] font-black tracking-tight wrap-break-word text-paper transition-[clip-path] delay-150 duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] hover:animate-glitch ${
            inView ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_100%_0_0)]"
          }`}
        >
          {title}
        </h2>
        {jp && (
          <p
            className={`mt-4 font-title text-paper/60 transition-[opacity,translate] delay-500 duration-500 ${
              inView ? "opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {jp}
          </p>
        )}
      </div>
    </div>
  );
}
