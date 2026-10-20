// Pilot service record: education, jobs, clubs, anything with dates.
// Newest first. Shown under the case files and printed with the page.
//
// period - free text, e.g. "2024 – PRESENT"
// org    - school, company or club
// role   - degree, job title or position
// detail - optional, one sentence
// status - "ACTIVE" | "COMPLETE"

export const record = [
  {
    period: "PRESENT",
    org: "University of Florida",
    role: "B.S. Computer Engineering",
    status: "ACTIVE",
  },
  {
    period: "OCT 2026",
    org: "SwampHacks XII",
    role: "Hackathon developer: Promptionary",
    detail:
      "Built a multiplayer AI party game with Samantha Anglo: the realtime game server, the game design and the Gemini pipeline.",
    status: "COMPLETE",
  },
  {
    period: "2026",
    org: "gabrielgoluch.me",
    role: "Designer and developer",
    detail: "This site: React, Vite and Tailwind, prerendered, with a strict security policy and synthesized audio.",
    status: "ACTIVE",
  },
];
