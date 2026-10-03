import App from "./App";
import Report from "./components/Report";
import { route } from "./lib/routes";

// Picks the page for a URL path: the home page or an incident report.
// main.jsx passes location.pathname; the prerender passes each route in turn.
export default function Root({ path }) {
  const page = route(path);
  return page.page === "report" ? <Report project={page.project} /> : <App />;
}
