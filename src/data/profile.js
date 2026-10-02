// Your personnel file. Everything the hero and footer display lives here.

export const profile = {
  firstName: "GABRIEL",
  lastName: "GOLUCH",
  designation: "DEVELOPER // BUILDER // PILOT CANDIDATE",
  tagline:
    "I build personal projects and occasionally sync with giant robots. This is the archive.",

  // Plain-language summary shown in the hero. Search engines lean on this
  // sentence to understand who the site is about, so keep it literal.
  about: "Gabriel Goluch is a computer engineering student at the University of Florida.",

  // Used only in the structured data search engines read (see vite.config.js).
  jobTitle: "Computer Engineering Student",
  school: { name: "University of Florida", url: "https://www.ufl.edu/" },

  // The three MAGI supercomputers each "vote" on you.
  // In the show they are Dr. Naoko Akagi as a scientist, a mother, and a woman.
  // Here: what you know, what you care about, and who you are outside of code.
  // Melchior's lines double as "knowsAbout" in the structured data.
  magi: {
    melchior: {
      role: "THE SCIENTIST",
      lines: ["JavaScript / React", "Python"],
    },
    balthasar: {
      role: "THE GUARDIAN",
      lines: ["Clean, useful tools", "Learning in public"],
    },
    casper: {
      role: "THE PERSON",
      lines: ["Anime & mecha"],
    },
  },
};
