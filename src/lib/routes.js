// The site's pages: the home page, plus one incident report per case file
// that has a write-up (projects.js: slug + report). Each report is
// prerendered to dist/files/<slug>/index.html at build time.

import { projects } from "../data/projects.js";

export const reports = projects.filter((p) => p.slug && p.report);

export const reportPath = (project) => `/files/${project.slug}/`;

// Which page a URL path shows: { page: "home" } or { page: "report", project }.
export function route(path) {
  const match = path.match(/^\/files\/([^/]+)\/?$/);
  const project = match && reports.find((p) => p.slug === match[1]);
  return project ? { page: "report", project } : { page: "home" };
}
