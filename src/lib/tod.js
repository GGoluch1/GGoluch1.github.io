// Tokyo-3 time of day, from the visitor's own clock. Sets <html data-tod>,
// which index.css uses for a sunset tint at dusk and a moon at night.

export function timeOfDay(date = new Date()) {
  const h = date.getHours();
  if (h >= 6 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

export function startTimeOfDay() {
  const set = () => {
    document.documentElement.dataset.tod = timeOfDay();
  };
  set();
  setInterval(set, 5 * 60 * 1000);
}
