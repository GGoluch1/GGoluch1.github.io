// Communication channels. Order here is the order on the page.

export const socials = [
  { name: "GITHUB", handle: "@GGoluch1", url: "https://github.com/GGoluch1" },
  { name: "LINKEDIN", handle: "/in/gabrielgoluch", url: "https://www.linkedin.com/in/gabrielgoluch" },
  { name: "X", handle: "@stormxtwo", url: "https://x.com/stormxtwo" },
  { name: "INSTAGRAM", handle: "@ggxluch", url: "https://www.instagram.com/ggxluch" },
];

// Email, listed after the socials. Kept in two halves so the address never
// appears whole in the page source or the JavaScript bundle, where spam
// scrapers look; the browser joins it (src/lib/email.js).
// Set to null to hide it.
export const email = { user: "ggoluch14", domain: "gmail.com" };
