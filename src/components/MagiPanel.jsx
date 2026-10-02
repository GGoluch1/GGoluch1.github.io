// One of the three MAGI computers. The outer div is the colored "border",
// the inner div is the panel face; both share the chamfered clip-path.
// `override` ({ tone: "red" | "green", stamp }) is used while Iruel hacks the MAGI.
const TONES = {
  green: ["bg-sync text-sync", "bg-[#0b1a06]"],
  red: ["bg-nerv text-nerv", "bg-[#1c0307]"],
  amber: ["bg-magi text-magi", "bg-panel"],
};

export default function MagiPanel({ name, number, data, approved, override, className = "" }) {
  const [tone, face] = TONES[override?.tone ?? (approved ? "green" : "amber")];
  const stamp = override?.stamp ?? (approved ? "承認" : "審議中");
  const stamped = override ? override.stamp !== "審議中" : approved;

  return (
    <div
      className={`group clip-panel p-0.5 transition duration-300 hover:-translate-y-1 hover:brightness-125 ${tone} ${className}`}
    >
      <div
        className={`sheen clip-panel h-full p-4 transition-colors duration-500 ${face}`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-title text-lg font-black tracking-wide">
            {name}·{number}
          </h2>
          <span key={stamp} className={`font-title font-black ${stamped ? "animate-stamp glow" : "animate-blink"}`}>
            {stamp}
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
