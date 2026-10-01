# gabrielgoluch.me

![MAGI system screen reading Gabriel Goluch, access granted](public/og-image.png)

My personal site: a portfolio and link hub styled after the MAGI supercomputer from *Neon Genesis Evangelion*.

**Live:** [gabrielgoluch.me](https://gabrielgoluch.me)

## Features

- **MAGI boot sequence** on first visit, with a shorter boot for returning visitors.
- **MAGI deliberation** hero where Melchior, Balthasar and Casper vote on the visitor.
- **NERV case files** for projects, with hover-to-declassify redactions and live GitHub stats.
- **Comms terminal** for social links and an optional résumé download.
- **Soft UI sounds**, synthesized with the Web Audio API and off by default.
- **Accessible motion**: everything still works with reduced motion turned on.

## Stack

React 19, Vite 8 and Tailwind CSS 4, deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173  (add ?boot to replay the boot sequence)
npm run build    # production build in dist/
npm run lint
```

## Editing content

All content lives in `src/data/`:

| File | What it controls |
| --- | --- |
| `profile.js` | Name, tagline, and the three MAGI panels |
| `projects.js` | Case files (projects). Field docs are at the top of the file |
| `socials.js` | Comms channels |
| `site.js` | Résumé path and GoatCounter analytics code |

## Security

- **Content-Security-Policy** is added to production builds by a plugin in `vite.config.js`. Any new outside service (a new API, font host or analytics domain) must be added to that policy or the browser will block it.
- **GoatCounter's script is self-hosted** in `public/vendor/goatcounter.js` so a change on their server can't alter what runs here.
- **GitHub Actions are pinned to commit SHAs**, and Dependabot opens weekly PRs for Actions and npm updates.
- The deploy fails if `npm audit` finds a high-severity vulnerability in a production dependency.

## Link preview image

`public/og-image.png` is rendered from `scripts/og-image.html` with headless Chrome:

```bash
chrome --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=8000 \
  --screenshot=public/og-image.png scripts/og-image.html
```

On Windows, `chrome` is usually `"C:\Program Files\Google\Chrome\Application\chrome.exe"`.

---

Fan-made tribute. *Neon Genesis Evangelion* belongs to its respective owners.
