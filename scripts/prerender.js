// Runs after `vite build` (see the build script in package.json).
// Renders each page to HTML and puts it inside <div id="root">: the home page
// into dist/index.html, and every incident report into
// dist/files/<slug>/index.html with its own title, description and URL in the
// <head>. Search engines and link-preview bots get the real text instead of an
// empty page. In the browser, src/main.jsx replaces this markup with the live app.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Use React's production server build (set before React is imported below).
process.env.NODE_ENV ??= "production";

const SSR_DIR = "dist-ssr";
const INDEX = "dist/index.html";
const ROOT = '<div id="root"></div>';

const { render, pages } = await import(pathToFileURL(`${SSR_DIR}/entry-server.js`).href);

// Inline style="" attributes in static HTML are blocked by the CSP (React sets
// styles from JavaScript, which the CSP allows). They only control animation
// timing, so drop them rather than fill the console with CSP warnings.
const markup = (path) => render(path).replace(/ style="[^"]*"/g, "");

const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// A <meta> tag by its name or property, however its attributes are wrapped.
const meta = (attr, value) => new RegExp(String.raw`<meta\s+${attr}="${value}"\s+content="[^"]*"\s*/>`);

// Swaps one tag in the template, and fails the build if it's gone missing.
function swap(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender: ${pattern} not found in ${INDEX}`);
  return html.replace(pattern, replacement);
}

const template = readFileSync(INDEX, "utf8");
if (!template.includes(ROOT)) throw new Error(`prerender: ${ROOT} not found in ${INDEX}`);
const base = template.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
if (!base) throw new Error(`prerender: no canonical URL in ${INDEX}`);

const home = markup("/");
writeFileSync(INDEX, template.replace(ROOT, `<div id="root">${home}</div>`));
console.log(`prerender: wrote ${(home.length / 1024).toFixed(1)} kB of HTML into ${INDEX}`);

for (const page of pages()) {
  const url = new URL(page.path, base).href;
  const title = escape(page.title);
  const description = escape(page.description);
  let html = template;
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = swap(html, meta("name", "description"), `<meta name="description" content="${description}" />`);
  html = swap(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`);
  html = swap(html, meta("property", "og:type"), '<meta property="og:type" content="article" />');
  html = swap(html, meta("property", "og:url"), `<meta property="og:url" content="${url}" />`);
  html = swap(html, meta("property", "og:title"), `<meta property="og:title" content="${title}" />`);
  html = swap(html, meta("property", "og:description"), `<meta property="og:description" content="${description}" />`);
  // The schema.org data describes the home page (the person), not a report.
  html = html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, "");
  html = html.replace(ROOT, `<div id="root">${markup(page.path)}</div>`);

  const file = `dist${page.path}index.html`;
  mkdirSync(`dist${page.path}`, { recursive: true });
  writeFileSync(file, html);
  console.log(`prerender: wrote ${file}`);
}

rmSync(SSR_DIR, { recursive: true, force: true });
