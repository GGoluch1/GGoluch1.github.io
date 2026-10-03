// Remembers the MAGI boot sequence (see bootMode in App.jsx).
export const BOOTED_KEY = "magi-booted"; // sessionStorage: booted in this tab already
export const VISITED_KEY = "magi-visited"; // localStorage: has ever seen the full boot

// sessionStorage: a section to open at once on the next page load, then
// forgotten. Set by an incident report's "back to the case files" link, so
// the home page doesn't need a #files in its address (which would stick to
// the tab and open the site mid-page on every reload or restored session).
export const SECTION_KEY = "magi-section";
