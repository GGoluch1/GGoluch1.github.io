// Each project is a classified NERV case file.
//
// file      - case number shown on the folder tab, e.g. "001"
// title     - project name
// blurb     - one or two sentences. Wrap words in [[double brackets]] to redact them;
//             they reveal when the card is hovered ("declassified").
// tags      - tech used
// status    - "OPEN" (in progress) | "UNDER REVIEW" (experimental) | "CLOSED" (finished / archived)
// progress  - 0-100, shown as "dossier completion"
// year      - shown in the file header
// image     - optional, put files in public/projects/ and reference as "/projects/name.png"
// repo      - optional source link
// live      - optional deployed link
// github    - optional "owner/repo"; shows live stats (last push, stars, language)
// slug      - optional; with a report, the project gets its own page at /files/<slug>/
// report    - optional incident report (a longer write-up), all plain text:
//             { problem, approach: [steps…], result }

export const projects = [
  {
    file: "001",
    title: "Personal Site",
    blurb: "This website. A MAGI-themed archive built on [[React, Vite, and Tailwind]].",
    tags: ["React", "Vite", "Tailwind"],
    status: "OPEN",
    progress: 60,
    year: "2026",
    image: "/projects/personal-site.webp",
    repo: "https://github.com/GGoluch1/GGoluch1.github.io",
    live: "https://gabrielgoluch.me",
    github: "GGoluch1/GGoluch1.github.io",
    slug: "personal-site",
    report: {
      problem:
        "A portfolio gets a few seconds of attention. Most look alike, and the ones that stand out are often slow, hard to read on a phone, or invisible to search engines.",
      approach: [
        "A React 19 single-page app built with Vite and Tailwind CSS 4, styled after the MAGI computers in Neon Genesis Evangelion.",
        "Every page is prerendered to HTML at build time, so search engines and link previews read the real text without running JavaScript.",
        "A strict Content-Security-Policy, a self-hosted analytics script, and GitHub Actions pinned to exact commits.",
        "No audio files: every sound, including the S-DAT's classical pieces, is synthesized in the browser with the Web Audio API.",
        "Works with reduced motion, from the keyboard, and on phones.",
        "A hidden easter-egg hunt: seven seals that open a page below the footer.",
      ],
      result: "Live at gabrielgoluch.me, rebuilt and deployed by GitHub Actions on every push.",
    },
  },
];
