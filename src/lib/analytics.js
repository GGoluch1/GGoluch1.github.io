import { site } from "../data/site";

// Loads GoatCounter only when a code is configured and we're not on localhost,
// so local development never pollutes your stats.
// Links marked with data-goatcounter-click are counted as events automatically.
export function initAnalytics() {
  const code = site.goatcounter;
  const host = window.location.hostname;
  if (!code || host === "localhost" || host === "127.0.0.1") return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "/vendor/goatcounter.js"; // self-hosted copy, see public/vendor/
  script.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  document.head.appendChild(script);
}

// Records a custom event (easter eggs, ID cards). A no-op wherever
// GoatCounter isn't loaded, including localhost.
export function track(path, title = path) {
  if (typeof window === "undefined") return;
  window.goatcounter?.count?.({ path, title, event: true });
}
