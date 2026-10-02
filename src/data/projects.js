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

export const projects = [
  {
    file: "001",
    title: "Personal Site",
    blurb: "This website. A MAGI-themed archive built on [[React, Vite, and Tailwind]].",
    tags: ["React", "Vite", "Tailwind"],
    status: "OPEN",
    progress: 60,
    year: "2026",
    repo: "https://github.com/GGoluch1/GGoluch1.github.io",
    live: "https://gabrielgoluch.me",
    github: "GGoluch1/GGoluch1.github.io",
  },
];
