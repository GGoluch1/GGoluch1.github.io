// Live data from outside services. Both return null when not configured
// or when the service can't be reached, and the UI hides or falls back.

import { site } from "../data/site";

// What you're listening to, via Last.fm (it can scrobble Spotify).
export async function fetchNowPlaying() {
  const { user, apiKey } = site.lastfm ?? {};
  if (!user || !apiKey) return null;

  const params = new URLSearchParams({
    method: "user.getrecenttracks",
    user,
    api_key: apiKey,
    format: "json",
    limit: "1",
  });
  const res = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`);
  if (!res.ok) return null;
  const track = (await res.json())?.recenttracks?.track?.[0];
  if (!track) return null;

  return {
    title: track.name,
    artist: track.artist?.["#text"] ?? "",
    art: track.image?.find((i) => i.size === "large")?.["#text"] ?? "",
    url: track.url,
    playing: track["@attr"]?.nowplaying === "true",
    at: track.date?.uts ? Number(track.date.uts) * 1000 : null,
  };
}

// Total visitors from GoatCounter, shown as "Angels repelled".
// Switched on by site.angelCounter (see src/data/site.js).
export async function fetchAngelCount() {
  if (!site.goatcounter || !site.angelCounter) return null;
  const KEY = "magi-angels";
  try {
    const cached = sessionStorage.getItem(KEY);
    if (cached) return cached;
  } catch {
    // storage blocked: just fetch
  }

  const res = await fetch(`https://${site.goatcounter}.goatcounter.com/counter/TOTAL.json`);
  if (!res.ok) return null;
  const count = (await res.json())?.count;
  if (!count) return null;
  try {
    sessionStorage.setItem(KEY, count);
  } catch {
    // ignore
  }
  return count;
}

export function timeAgo(ms) {
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}M AGO`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}H AGO`;
  return `${Math.round(hours / 24)}D AGO`;
}
