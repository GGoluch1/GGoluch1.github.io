import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Root from "./Root.jsx";
import { initAnalytics } from "./lib/analytics.js";
import { initTheme } from "./lib/theme.js";
import { startTimeOfDay } from "./lib/tod.js";

// Activate the non-blocking font stylesheets from index.html.
document.querySelectorAll("link[data-async-font]").forEach((link) => {
  link.media = "all";
});

// The site always opens at the top: the browser shouldn't put back an old
// scroll position on reload or back/forward (see App.jsx). Set before
// anything renders, so it applies to this page load too.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

initAnalytics();
startTimeOfDay();
initTheme();

// #root already holds prerendered HTML for search engines (scripts/prerender.js).
// createRoot replaces it instead of hydrating, because the boot screen, clock and
// animations legitimately differ from the build-time snapshot. Root picks the
// page (home or an incident report) from the path.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root path={window.location.pathname} />
  </StrictMode>,
);
