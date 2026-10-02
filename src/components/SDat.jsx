import { useEffect, useState } from "react";
import { site } from "../data/site";
import { fetchNowPlaying, timeAgo } from "../lib/remote";

// Shinji's S-DAT, which only ever shows tracks 25 and 26. If Last.fm is set
// up in src/data/site.js it also shows what you're actually listening to;
// otherwise it just loops 25 and 26 like the real thing.

function Reel({ spinning }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-7 text-magi ${spinning ? "animate-spin [animation-duration:3s]" : ""}`} aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 3.5v5M4.6 16.3l4.3-2.5M19.4 16.3l-4.3-2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function useNowPlaying() {
  const [np, setNp] = useState(null);

  useEffect(() => {
    if (!site.lastfm?.user || !site.lastfm?.apiKey) return;
    let cancelled = false;
    const load = () => {
      if (document.visibilityState !== "visible") return;
      fetchNowPlaying()
        .then((data) => !cancelled && setNp(data))
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 60_000);
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  return np;
}

export default function SDat() {
  const np = useNowPlaying();
  const [track, setTrack] = useState(25);

  useEffect(() => {
    const id = setInterval(() => setTrack((t) => (t === 25 ? 26 : 25)), 6000);
    return () => clearInterval(id);
  }, []);

  const playing = !np || np.playing;
  const status = !np ? "▶ REPEAT" : np.playing ? "▶ PLAY" : `■ STOP // ${np.at ? timeAgo(np.at) : ""}`;
  const Wrapper = np?.url ? "a" : "div";
  const linkProps = np?.url ? { href: np.url, target: "_blank", rel: "noreferrer", "data-goatcounter-click": "sdat" } : {};

  return (
    <Wrapper {...linkProps} className="group block border-2 border-magi/60 bg-panel transition-colors hover:border-magi">
      <div className="flex justify-between border-b border-magi/40 px-3 py-1 text-xs tracking-widest">
        <span>S-DAT // 再生中</span>
        <span className={playing ? "text-sync" : "text-magi/70"}>{status}</span>
      </div>
      <div className="flex items-center gap-4 p-3">
        {np?.art ? (
          <img src={np.art} alt="" className="size-16 shrink-0 border border-magi/50 object-cover grayscale transition group-hover:grayscale-0" />
        ) : (
          <div className="flex shrink-0 gap-2 border border-magi/50 px-2 py-4">
            <Reel spinning={playing} />
            <Reel spinning={playing} />
          </div>
        )}
        <div className="min-w-0 flex-1 bg-[#0b1408] px-3 py-2 text-sync">
          <p className="font-title text-xl font-black tabular-nums">TRACK {track}</p>
          {np ? (
            <>
              <p className="truncate text-sm text-paper">{np.title}</p>
              <p className="truncate text-xs text-sync/80">{np.artist}</p>
            </>
          ) : (
            <p className="text-xs text-sync/80">REPEAT ALL // 25 ⇄ 26</p>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
