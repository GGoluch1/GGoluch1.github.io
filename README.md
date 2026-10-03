# gabrielgoluch.me

![MAGI system screen reading Gabriel Goluch, access granted](public/og-image.png)

My personal site: a portfolio and link hub styled after the MAGI supercomputer from *Neon Genesis Evangelion*.

**Live:** [gabrielgoluch.me](https://gabrielgoluch.me)

## Features

- **MAGI boot sequence** on first visit, with a shorter boot for returning visitors.
- **MAGI deliberation** hero where Melchior, Balthasar and Casper vote on the visitor.
- **NERV case files** for projects, with hover-to-declassify redactions and live GitHub stats.
- **Incident reports**: a case file with a write-up gets its own prerendered page at `/files/<slug>/`.
- **Pilot service record**: education, jobs and clubs as a NERV personnel history.
- **Comms terminal** for social links, email and an optional résumé download. The email address is joined in the browser, so it never appears whole in the page source.
- **NERV ID card maker**: visitors issue themselves a personnel card, drawn on a canvas and downloaded as a PNG. Photos never leave their device.
- **S-DAT player** that plays classical pieces synthesized in the browser, including the ones Evangelion itself uses (Bach's Air and Jesu, Joy of Man's Desiring, Handel's Hallelujah). Its display only ever shows tracks 25 and 26, and pressing play puts the earphones in: the rest of the page goes grey and quiet.
- **MAGI terminal**: press `` ` `` (or the footer button) for a command line with Tab completion. Try `help`, `man <command>` or `magifetch`.
- **Tokyo-3 time of day**: a sunset tint in the evening and a moon at night, from the visitor's clock.
- **Eva unit colors**: MAGI, Unit-00, Unit-01 or Unit-02, picked in the footer.
- **Umbilical cable** in the nav. Unplug it and the internal battery lasts five minutes.
- **Mission briefing** with what I'm working on now (`src/data/briefing.js`), the latest public GitHub commits as a MAGI activity log, and a 次回予告 "next episode" preview.
- **Eva calendar**: premieres, Second Impact and birthdays change the emergency bar. Preview a date with `?date=MM-DD`.
- **A.T. Field** ripples when you click anywhere that isn't a link or button.
- **Soft UI sounds**, synthesized with the Web Audio API and off by default.
- **Accessible motion**: everything still works with reduced motion turned on.
- **Print**: printing the page gives a plain black-on-white dossier.
- **No JavaScript**: the prerendered page still reads properly (`public/noscript.css`).
- **Installable**: home-screen icons and a web manifest.
- Some things only show up if you go looking.

## Stack

React 19, Vite 8 and Tailwind CSS 4, deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173  (add ?boot to replay the boot sequence)
npm run build    # production build in dist/, with every page prerendered
npm run lint     # oxlint
npm run format   # Prettier (CI checks it with npm run format:check)
```

Pull requests (Dependabot's included) are linted, format-checked and built by `.github/workflows/ci.yml` before they can be merged.

## Editing content

All content lives in `src/data/`:

| File | What it controls |
| --- | --- |
| `profile.js` | Name, nickname, tagline, the plain-language summary, and the three MAGI panels |
| `projects.js` | Case files (projects) and their incident reports. Field docs are at the top of the file |
| `record.js` | Pilot service record: education, jobs, clubs |
| `briefing.js` | Mission briefing: current tasks, when they were last updated, and the next-episode preview |
| `socials.js` | Comms channels and the email address |
| `site.js` | Live URL, résumé path, GitHub username for the activity log, GoatCounter analytics and the visitor counter |

Project screenshots go in `public/projects/` (WebP keeps them small).

## Search engines

- **Prerendered HTML**: `npm run build` renders every page with React's server renderer (`src/entry-server.jsx`, `scripts/prerender.js`): the home page into `dist/index.html` and each incident report into `dist/files/<slug>/index.html` with its own title, description and canonical URL. Crawlers see the text without running JavaScript. In the browser, the live app replaces it.
- **Structured data**: a schema.org `Person` (name, school, profile links) is generated from `src/data/` by a plugin in `vite.config.js`. Validate it with [Google's Rich Results Test](https://search.google.com/test/rich-results).
- **Sitemap**: `sitemap.xml` lists the home page and every incident report, generated at build time with the build date as `lastmod`. `robots.txt` points to it.
- The `<title>` and description in `index.html` are deliberately plain. They're what Google shows in results.

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

## Home-screen icons

`public/apple-touch-icon.png`, `public/icon-192.png` and `public/icon-512.png` are rendered from `scripts/app-icon.html`. Headless Chrome can't open a window smaller than about 500px, so the small sizes are rendered at three times the size and scaled down:

```bash
chrome --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=512,512 \
  --virtual-time-budget=6000 --screenshot=public/icon-512.png scripts/app-icon.html
chrome --headless=new --hide-scrollbars --force-device-scale-factor=0.3333333 --window-size=576,576 \
  --virtual-time-budget=6000 --screenshot=public/icon-192.png scripts/app-icon.html
chrome --headless=new --hide-scrollbars --force-device-scale-factor=0.3333333 --window-size=540,540 \
  --virtual-time-budget=6000 --screenshot=public/apple-touch-icon.png scripts/app-icon.html
```

---

Fan-made tribute. *Neon Genesis Evangelion* belongs to its respective owners.
