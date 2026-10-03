// Date formatting shared by the briefing, the activity log and the terminal.

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// "today", "3 days ago", "2 months ago"…
export function relative(iso) {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (Math.abs(days) < 1) return "today";
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
}

// "2026-10-02" or a full ISO timestamp, as NERV writes dates: "2026.10.02".
export const dotDate = (iso) => iso.slice(0, 10).replaceAll("-", ".");
