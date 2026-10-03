// Your personnel file. Everything the hero and footer display lives here.

// Pilots in Eva are "Children", picked by the Marduk Institute.
const child = "SIXTH CHILD";

export const profile = {
  firstName: "GABRIEL",
  lastName: "GOLUCH",
  // What the footer motto calls you: "GABE'S IN HIS HEAVEN."
  nickname: "GABE",
  child,
  designation: `${child} // MARDUK INSTITUTE SELECTION`,
  // Shinji's line from the first episode, before he gets in the robot.
  tagline: "I mustn't run away. I mustn't run away. I mustn't run away.",

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
      lines: ["The hedgehog's dilemma", "Instrumentality: vetoed"],
    },
    casper: {
      role: "THE PERSON",
      lines: ["Anime & mecha"],
    },
  },
};
