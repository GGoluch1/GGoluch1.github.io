// Runs after `vite build` (see the build script in package.json).
// Renders <App /> to HTML and puts it inside <div id="root"> in dist/index.html,
// so search engines and link-preview bots get the real text instead of an
// empty page. In the browser, src/main.jsx replaces this markup with the live app.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

// Use React's production server build (set before React is imported below).
process.env.NODE_ENV ??= 'production'

const SSR_DIR = 'dist-ssr'
const INDEX = 'dist/index.html'
const ROOT = '<div id="root"></div>'

const { render } = await import(pathToFileURL(`${SSR_DIR}/entry-server.js`).href)

// Inline style="" attributes in static HTML are blocked by the CSP (React sets
// styles from JavaScript, which the CSP allows). They only control animation
// timing, so drop them rather than fill the console with CSP warnings.
const app = render().replace(/ style="[^"]*"/g, '')

const html = readFileSync(INDEX, 'utf8')
if (!html.includes(ROOT)) throw new Error(`prerender: ${ROOT} not found in ${INDEX}`)
writeFileSync(INDEX, html.replace(ROOT, `<div id="root">${app}</div>`))
rmSync(SSR_DIR, { recursive: true, force: true })

console.log(`prerender: wrote ${(app.length / 1024).toFixed(1)} kB of HTML into ${INDEX}`)
