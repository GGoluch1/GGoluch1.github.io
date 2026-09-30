// Scrolling NERV emergency banner. Content is duplicated so the loop is seamless.
// Hovering pauses it.
export default function AlertBar({ text }) {
  const items = Array.from({ length: 6 }, () => text);

  return (
    <div className="group overflow-hidden bg-nerv py-1.5 text-void" aria-hidden="true">
      <div className="flex w-max animate-marquee whitespace-nowrap font-title font-black tracking-widest group-hover:[animation-play-state:paused]">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="px-6">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
