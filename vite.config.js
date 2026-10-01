import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { site } from './src/data/site.js'

// Collects every character used in src/ (plus all printable ASCII) and passes
// them to Google Fonts' `text=` parameter, so the browser downloads a tiny
// Noto Serif JP file instead of the full Japanese font.
// In dev, restart `npm run dev` after adding new Japanese characters.
function subsetTitleFont() {
  const collect = (dir, chars) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) collect(path, chars)
      else if (/\.(jsx?|css)$/.test(name)) for (const ch of readFileSync(path, 'utf8')) chars.add(ch)
    }
  }

  return {
    name: 'subset-title-font',
    transformIndexHtml(html) {
      const chars = new Set()
      for (let c = 0x20; c < 0x7f; c++) chars.add(String.fromCharCode(c))
      collect('src', chars)
      const text = [...chars].filter((ch) => ch >= ' ').sort().join('')
      return html.replace('text=%TITLE_FONT_TEXT%', `text=${encodeURIComponent(text)}`)
    },
  }
}

// Content-Security-Policy, added to production builds only (Vite's dev server
// needs inline scripts the policy would block). GitHub Pages can't send custom
// headers, so it's delivered as a <meta> tag. Every outside service the site
// talks to must be listed here, or the browser will block it.
function contentSecurityPolicy() {
  const goatcounter = site.goatcounter ? `https://${site.goatcounter}.goatcounter.com` : ''
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com',
    `img-src 'self' data: ${goatcounter}`,
    `connect-src 'self' https://api.github.com ${goatcounter}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    'upgrade-insecure-requests',
  ]
    .map((d) => d.trim())
    .join('; ')

  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), subsetTitleFont(), contentSecurityPolicy()],
})
