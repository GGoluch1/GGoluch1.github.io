// Mission briefing: what you're working on right now. Update `updated` when you change it.
//
// status - "ACTIVE" | "STANDBY" | "COMPLETE"
// next   - the "next episode" preview under the briefing (次回予告), teasing
//          what's coming. Set to null to hide it.

export const briefing = {
  updated: "2026-10-20",
  tasks: [
    { name: "Upgrade resume", status: "ACTIVE" },
    { name: "Develop the website", status: "STANDBY" },
  ],
  next: {
    title: "NEW CASE FILES",
    teaser:
      "The Sixth Child returns to the archive. New projects are being declassified. What waits inside the next file?",
  },
};
