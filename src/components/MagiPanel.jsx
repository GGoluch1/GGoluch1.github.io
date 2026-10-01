// One of the three MAGI computers. The outer div is the colored "border",
// the inner div is the panel face; both share the chamfered clip-path.
export default function MagiPanel({ name, number, data, approved, className = "" }) {
  const tone = approved ? "bg-sync text-sync" : "bg-magi text-magi";

  return (
    <div
      className={`group clip-panel p-0.5 transition duration-300 hover:-translate-y-1 hover:brightness-125 ${tone} ${className}`}
    >
      <div
        className={`sheen clip-panel h-full p-4 transition-colors duration-500 ${
          approved ? "bg-[#0b1a06]" : "bg-panel"
        }`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-title text-lg font-black tracking-wide">
            {name}·{number}
          </h2>
          <span
            key={String(approved)}
            className={`font-title font-black ${approved ? "animate-stamp glow" : "animate-blink"}`}
          >
            {approved ? "承認" : "審議中"}
          </span>
        </div>
        <p className="text-[10px] tracking-[0.3em] opacity-80">{data.role}</p>
        <ul className="mt-3 space-y-1 text-xs text-paper/80">
          {data.lines.map((line, i) => (
            <li
              key={line}
              className="transition-transform duration-300 group-hover:translate-x-1"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              › {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
