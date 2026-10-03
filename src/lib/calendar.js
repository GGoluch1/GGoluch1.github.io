// The Eva calendar: premieres, Second Impact and character birthdays.
// On these days the emergency bar carries the event, and birthdays suggest
// that pilot's unit colors. Preview any date with ?date=MM-DD.

const ordinal = (n) => {
  const s = ["TH", "ST", "ND", "RD"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

// prettier-ignore
export const EVENTS = {
  "03-08": { jp: "シン・エヴァンゲリオン劇場版 公開記念日", en: "EVANGELION 3.0+1.0 PREMIERED MARCH 8, 2021", year: 2021 },
  "03-30": { jp: "綾波レイ 誕生日", en: "HAPPY BIRTHDAY, REI AYANAMI", unit: "00" },
  "06-06": { jp: "碇シンジ 誕生日", en: "HAPPY BIRTHDAY, SHINJI IKARI", unit: "01" },
  "07-19": { jp: "旧劇場版 公開記念日", en: "THE END OF EVANGELION PREMIERED JULY 19, 1997", year: 1997 },
  "09-01": { jp: "新劇場版 序 公開記念日", en: "EVANGELION 1.0 PREMIERED SEPT 1, 2007", year: 2007 },
  "09-13": { jp: "セカンドインパクト // 渚カヲル 誕生日", en: "SECOND IMPACT, SEPT 13, 2000 // HAPPY BIRTHDAY, KAWORU NAGISA" },
  "10-04": { jp: "新世紀エヴァンゲリオン 放送開始記念日", en: "NEON GENESIS EVANGELION PREMIERED OCT 4, 1995", year: 1995 },
  "12-04": { jp: "惣流・アスカ・ラングレー 誕生日", en: "HAPPY BIRTHDAY, ASUKA LANGLEY SORYU", unit: "02" },
  "12-08": { jp: "葛城ミサト 誕生日", en: "HAPPY BIRTHDAY, MISATO KATSURAGI" },
};

function todayKey() {
  if (typeof window !== "undefined") {
    const preview = new URLSearchParams(window.location.search).get("date");
    if (preview && EVENTS[preview]) return preview;
  }
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function describe(key, year) {
  const e = EVENTS[key];
  const anniversary = e.year ? ` // ${ordinal(year - e.year)} ANNIVERSARY` : "";
  return { key, ...e, text: `★ ${e.jp} // ${e.en}${anniversary}` };
}

// Today's event, or null. Always null while prerendering, so the static HTML
// doesn't bake in the build day's event.
export function todaysEvent() {
  if (typeof window === "undefined") return null;
  const key = todayKey();
  return EVENTS[key] ? describe(key, new Date().getFullYear()) : null;
}

// Every event, starting from the next one.
export function upcoming() {
  const today = todayKey();
  const year = new Date().getFullYear();
  const keys = Object.keys(EVENTS).sort();
  const next = keys.filter((k) => k >= today);
  const later = keys.filter((k) => k < today);
  return [
    ...next.map((k) => ({ date: `${year}.${k.replace("-", ".")}`, ...describe(k, year) })),
    ...later.map((k) => ({ date: `${year + 1}.${k.replace("-", ".")}`, ...describe(k, year + 1) })),
  ];
}
