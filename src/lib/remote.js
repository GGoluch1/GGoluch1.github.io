// Live data from outside services. Returns null when not configured or when
// the service can't be reached, and the UI hides.

import { site } from "../data/site";

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
