// LCL rising up the screen with bubbles, for the sync test (seal 2) and
// Third Impact. Always LCL orange, whatever Eva unit theme is picked.
// Fills its positioned parent; children sit on top of the liquid.
export default function Lcl({ bubbles = 18, className = "", children }) {
  return (
    <div
      className={`absolute inset-0 animate-flood bg-[linear-gradient(to_top,#8a2e00,#ff8a1f_50%,#ffb347)] ${className}`}
    >
      {Array.from({ length: bubbles }, (_, i) => (
        <span
          key={i}
          className="absolute bottom-0 animate-bubble rounded-full border border-paper/60"
          style={{
            left: `${(i * 41) % 100}%`,
            width: `${5 + ((i * 11) % 18)}px`,
            height: `${5 + ((i * 11) % 18)}px`,
            animationDelay: `${(i * 0.19) % 2.6}s`,
          }}
        />
      ))}
      {children}
    </div>
  );
}
