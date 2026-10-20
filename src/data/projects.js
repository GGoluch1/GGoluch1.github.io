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
// devpost   - optional, hackathon projects only: the Devpost submission page
// github    - optional "owner/repo"; shows live stats (last push, stars, language)
// slug      - optional; with a report, the project gets its own page at /files/<slug>/
// report    - optional incident report (a longer write-up), all plain text:
//             { problem, approach: [steps…], result }

export const projects = [
  {
    file: "002",
    title: "Promptionary",
    blurb:
      "A SwampHacks XII party game: describe a secret image without its banned words, [[Gemini draws what it heard]], and everyone races to guess it.",
    tags: ["Node.js", "Socket.io", "TypeScript", "Gemini API", "Next.js"],
    status: "CLOSED",
    progress: 100,
    year: "2026",
    image: "/projects/promptionary.webp",
    repo: "https://github.com/samanglo814/Promptionary",
    devpost: "https://devpost.com/software/promptionary",
    github: "samanglo814/Promptionary",
    slug: "promptionary",
    report: {
      problem:
        "AI tools usually hide the gap between what you say and what the model understands. Promptionary makes that gap the game. One player describes a secret image out loud without saying its banned words, Gemini draws what it heard, and the other players race to guess the image. It had to run live on a shared screen with up to eight phones joining by QR code, be built over one hackathon weekend, and survive free-tier AI quotas.",
      approach: [
        "Built in a team of two with Samantha Anglo, who did the frontend, the product design and the deployment. Gabriel built the game server, designed the game, and wrote the core Gemini pipeline.",
        "The server, written in TypeScript with Express and Socket.io, owns all game state: a state machine runs every room, phase, timer and score, and the host screen and phones only render what it broadcasts. Deadlines are sent as timestamps, so every screen counts down to the same moment.",
        "Reconnect handling gives a describer who refreshes their phone a grace period to rejoin before their turn is skipped.",
        "Gemini transcribes the description and draws it. A single structured-JSON call then scores the drawing against the target, rates every guess and writes a roast caption, which uses one call of the free-tier quota instead of several.",
        "Designed the two-round format and the points system: accuracy, clarity, speed and banned-word penalties, with guess values that scale with room size and a 1.5x second round.",
        "Expanded the target bank from 20 to 100 scenes and gave the cards and the AI's drawings a shared art style, so the two can be compared directly.",
        "An automated five-bot game checks every payload against the data contract, and runs in CI alongside the unit tests on every pull request.",
      ],
      result:
        "A playable 2–8 player game with no accounts or installs, submitted to five SwampHacks XII tracks, including Best Use of Gemini API and Best Entertainment & Creative Technology Hack.",
    },
  },
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
