// Site-wide settings. Leave a value empty ("") to switch that feature off.

export const site = {
  // The live address. Used for the sitemap and search-engine structured data.
  url: "https://gabrielgoluch.me/",

  // Your résumé, presented as a downloadable "personnel dossier" in the comms section.
  // Put the PDF in public/ and set this to its path, e.g. "/gabriel-goluch-resume.pdf".
  resume: "",

  // GoatCounter analytics (free, no cookies). Dashboard: https://ggoluch1.goatcounter.com
  // Only counts on the live site, never on localhost.
  goatcounter: "ggoluch1",

  // Show the GoatCounter visitor total in the nav as "Angels repelled".
  // First turn on "Allow adding visitor counts on your website" in GoatCounter's
  // settings, then set this to true.
  angelCounter: false,

  // Last.fm, for the S-DAT's "now playing". Connect Spotify to Last.fm, then get
  // a free API key at https://www.last.fm/api/account/create. The key is read-only
  // and meant to be public. Leave either empty and the S-DAT just loops 25 and 26.
  lastfm: { user: "", apiKey: "" },
};
