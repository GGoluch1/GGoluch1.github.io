import { renderToString } from "react-dom/server";
import { profile } from "./data/profile.js";
import { reportPath, reports } from "./lib/routes.js";
import Root from "./Root.jsx";

// Build-time only: scripts/prerender.js calls these to bake each page's text
// into its HTML file, so crawlers see content without running JavaScript.

export function render(path) {
  return renderToString(<Root path={path} />);
}

// Every page besides the home page, with the title and description its
// <head> should carry.
export function pages() {
  const name = `${profile.firstName[0]}${profile.firstName.slice(1).toLowerCase()} ${profile.lastName[0]}${profile.lastName.slice(1).toLowerCase()}`;
  return reports.map((project) => ({
    path: reportPath(project),
    title: `${project.title} · Incident report · ${name}`,
    description: project.blurb.replace(/\[\[(.+?)\]\]/g, "$1"),
  }));
}
