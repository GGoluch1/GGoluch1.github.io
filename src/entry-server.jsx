import { renderToString } from "react-dom/server";
import App from "./App.jsx";

// Build-time only: scripts/prerender.js calls this to bake the page's text
// into dist/index.html, so crawlers see content without running JavaScript.
export function render() {
  return renderToString(<App />);
}
