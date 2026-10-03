import { useEffect, useRef, useState } from "react";
import { briefing } from "../data/briefing";
import { profile } from "../data/profile";
import { projects } from "../data/projects";
import { socials } from "../data/socials";
import { todaysEvent, upcoming } from "../lib/calendar";
import { BONUSES, SEALS, isUnlocked, nextHint, resetSeele, sealCount, useSeele } from "../lib/eggs";
import { emailAddress } from "../lib/email";
import { dotDate } from "../lib/format";
import { goTo } from "../lib/navigate";
import { plugIn, unplug } from "../lib/power";
import { fetchAngelCount } from "../lib/remote";
import { reportPath, reports } from "../lib/routes";
import { sdat } from "../lib/sdat";
import { setSound } from "../lib/sound";
import { UNITS, setUnit, useUnit } from "../lib/theme";
import { timeOfDay } from "../lib/tod";
import { openUi } from "../lib/ui";
import Modal from "./Modal";

// A MAGI command line. Open with the ` key, or the button in the footer.
// Tab completes commands and their arguments; ↑ and ↓ walk the history.

const HELP = `AVAILABLE COMMANDS // TAB COMPLETES
  help              this list
  man <command>     more about one command
  whoami            personnel file
  magifetch         system summary
  ls [dir]          list files
  cat <file>        read a file
  open <section>    go to magi, files, comms (cd works too)
  open <case>       read a case file's incident report
  briefing          current operations
  calendar          upcoming Eva dates
  email             the pilot's address (copied for you)
  id                issue yourself a NERV ID card
  play / stop       the S-DAT
  unit <name>       colors: magi, 00, 01, 02
  unplug / plug     the umbilical cable
  stats             angels repelled so far
  seele             scenario progress
  hint              ask SEELE for guidance
  sound on|off      interface sounds
  date              Tokyo-3 local time
  clear             clear the screen
  exit              close the terminal`;

// Manual pages for `man`. Anything not listed falls back to its help line.
const MAN = {
  help: "help\n  Lists every command. 'man <command>' explains one in more detail.",
  man: "man <command>\n  Shows this kind of page for a command. Try 'man seele'.",
  whoami: "whoami\n  Prints the personnel file: name, designation, and what Melchior knows.",
  magifetch: "magifetch\n  A summary of this MAGI terminal and its pilot, neofetch style.",
  ls: "ls [dir]\n  Lists the root, or one of: case_files, comms, dogma.\n  dogma stays sealed until all seven seals are broken.",
  cat: "cat <file>\n  Reads a case file by number ('cat 001') or seele.txt (the scenario).",
  open: "open <section | case>\n  Scrolls to magi, files or comms, or opens a case file's incident\n  report ('open 001'). cd is the same command.",
  briefing: "briefing\n  The mission briefing: what the pilot is working on right now.",
  calendar:
    "calendar\n  Upcoming Evangelion dates: premieres, Second Impact, birthdays.\n  On the day, the emergency bar carries the event.",
  email: "email\n  Prints the pilot's email address and copies it to the clipboard.",
  id: "id\n  Opens the NERV ID card maker. Your photo never leaves your device.",
  play: "play / stop\n  Starts or stops the S-DAT. It only ever shows tracks 25 and 26.",
  unit: "unit <magi | 00 | 01 | 02>\n  Repaints the site in an Evangelion unit's colors. Remembered next visit.",
  unplug: "unplug / plug\n  Disconnects the umbilical cable. Internal power lasts five minutes.",
  stats: "stats\n  How many Angels (visitors) the site has repelled so far.",
  seele:
    "seele [reset]\n  Scenario progress: seven seals, the bonuses, and the endings seen.\n  'seele reset --yes' forgets everything.",
  hint: "hint\n  SEELE's guidance toward the next unbroken seal.",
  sound: "sound <on | off>\n  Interface sounds. Off by default.",
  date: "date\n  Tokyo-3 time, and today's Eva calendar event if there is one.",
  clear: "clear\n  Clears the screen.",
  exit: "exit\n  Closes the terminal. So does the ` key.",
};

// prettier-ignore
const COMMANDS = [
  "help", "man", "whoami", "magifetch", "ls", "cat", "open", "cd", "briefing", "calendar", "email", "id",
  "play", "stop", "unit", "unplug", "plug", "stats", "seele", "hint", "sound", "date", "clear", "exit",
];

// What Tab can complete after each command.
const ARGS = {
  man: COMMANDS,
  ls: ["case_files", "comms", "dogma"],
  cat: ["seele.txt", ...projects.map((p) => p.file)],
  open: ["magi", "files", "comms", "dogma", ...reports.map((p) => p.file)],
  cd: ["magi", "files", "comms", "dogma", ...reports.map((p) => p.file)],
  unit: UNITS.map((u) => u.id),
  sound: ["on", "off"],
  seele: ["reset"],
};

// The longest start that every option shares.
function commonPrefix(options) {
  return options.reduce((prefix, option) => {
    let i = 0;
    while (i < prefix.length && prefix[i] === option[i]) i++;
    return prefix.slice(0, i);
  });
}

// The MAGI, for magifetch: Balthasar on top, Casper and Melchior below.
const MAGI_ART = [
  "     ┌─────────┐     ",
  "     │BALTHASAR│     ",
  "     └────┬────┘     ",
  "  ┌───────┴───────┐  ",
  "┌─┴──────┐ ┌──────┴─┐",
  "│ CASPER │ │MELCHIOR│",
  "└────────┘ └────────┘",
];

const WELCOME = [
  { text: "MAGI SYSTEM // 第7世代有機コンピュータ", tone: "sys" },
  { text: "MELCHIOR-1 · BALTHASAR-2 · CASPER-3 ONLINE", tone: "sys" },
  { text: "TYPE 'help' FOR COMMANDS.", tone: "out" },
];

const TONE = {
  cmd: "text-paper",
  out: "text-magi",
  sys: "text-magi/80",
  ok: "text-sync",
  err: "text-nerv",
};

const plain = (blurb) => blurb.replace(/\[\[(.+?)\]\]/g, "$1");

function listing(dir, seele) {
  if (!dir || dir === "/" || dir === "~") {
    return `case_files/   comms/   seele.txt   dogma/${isUnlocked(seele) ? "" : "  [SEALED]"}`;
  }
  if (dir.startsWith("case")) return projects.map((p) => `${p.file}   ${p.title}   [${p.status}]`).join("\n");
  if (dir.startsWith("comms")) {
    const email = emailAddress();
    const rows = socials.map((s) => `${s.name.padEnd(10)} ${s.url}`);
    return [...rows, ...(email ? [`${"EMAIL".padEnd(10)} ${email}`] : [])].join("\n");
  }
  if (dir.startsWith("dogma")) return isUnlocked(seele) ? "lilith   lance_of_longinus   lcl" : null;
  return undefined;
}

function seeleReport(seele) {
  const rows = SEALS.map((s, i) => {
    const broken = seele.found.has(s.id);
    return `SEAL ${i + 1}  ${broken ? "◉" : "○"}  ${broken ? s.name : "??????"}`;
  });
  BONUSES.filter((b) => seele.found.has(b.id)).forEach((b) => rows.push(`BONUS   ◉  ${b.name}`));
  if (seele.ended) rows.push(`ENDINGS    TV ◉  END OF EVANGELION ${seele.eoe ? "◉" : "○"}`);
  return `THE SCENARIO // ${sealCount(seele)} OF 7 SEALS BROKEN\n${rows.join("\n")}`;
}

function magifetch(seele, unit) {
  const seconds = Math.floor(performance.now() / 1000);
  const uptime = `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
  const info = [
    `PILOT        ${profile.lastName}, ${profile.firstName}`,
    `DESIGNATION  ${profile.child}`,
    `AFFILIATION  ${profile.school.name.toUpperCase()}`,
    `HOST         MAGI-01 // 7TH GEN ORGANIC`,
    `UPTIME       ${uptime}`,
    `COLORS       ${UNITS.find((u) => u.id === unit)?.label ?? "MAGI"}`,
    `SEALS        ${sealCount(seele)} OF 7`,
  ];
  return MAGI_ART.map((art, i) => `${art}   ${info[i] ?? ""}`).join("\n");
}

export default function Terminal({ onClose }) {
  const seele = useSeele();
  const unit = useUnit();
  const [lines, setLines] = useState(WELCOME);
  const [input, setInput] = useState("");
  const history = useRef([]);
  const cursor = useRef(0);
  const outRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);

  const print = (text, tone = "out") => setLines((l) => [...l, { text, tone }]);

  // Close, then act once the dialog has handed focus back.
  const thenClose = (fn) => {
    onClose();
    setTimeout(fn, 60);
  };

  const run = async (raw) => {
    const [word = "", ...args] = raw.trim().split(/\s+/);
    const cmd = word.toLowerCase();
    const arg = args.join(" ").toLowerCase();

    switch (cmd) {
      case "":
        return;
      case "help":
      case "?":
        return print(HELP);
      case "man": {
        if (!arg) return print("man: WHICH COMMAND? TRY 'man seele'.", "err");
        const page = MAN[arg] ?? MAN[{ cd: "open", stop: "play", plug: "unplug" }[arg]];
        return page ? print(page) : print(`man: NO MANUAL ENTRY FOR ${arg}`, "err");
      }
      case "magifetch":
      case "neofetch":
        return print(magifetch(seele, unit));
      case "email": {
        const email = emailAddress();
        if (!email) return print("email: NO ADDRESS ON FILE", "err");
        print(email);
        return navigator.clipboard
          ?.writeText(email)
          .then(() => print("COPIED TO CLIPBOARD", "ok"))
          .catch(() => {});
      }
      case "whoami":
        return print(
          `${profile.lastName}, ${profile.firstName}\n${profile.designation}\n${profile.about}\nMELCHIOR // ${profile.magi.melchior.lines.join(", ")}`,
        );
      case "ls":
      case "dir": {
        const out = listing(arg, seele);
        if (out === null) return print("HEAVEN'S DOOR IS SEALED.", "err");
        if (out === undefined) return print(`ls: ${arg}: NO SUCH DIRECTORY`, "err");
        return print(out);
      }
      case "cat": {
        if (!arg) return print("cat: WHICH FILE?", "err");
        if (arg.includes("seele")) return print(seeleReport(seele));
        const p = projects.find((x) => arg.endsWith(x.file) || arg.includes(x.title.toLowerCase()));
        if (p) {
          return print(
            `CASE No.${p.file} // ${p.title} // ${p.year}\n${plain(p.blurb)}\nTAGS: ${p.tags.join(", ")}\nSTATUS: ${p.status}${p.repo ? `\nSOURCE: ${p.repo}` : ""}${p.live ? `\nDEPLOY: ${p.live}` : ""}${p.report ? `\nREPORT: 'open ${p.file}'` : ""}`,
          );
        }
        if (arg.includes("lilith") || arg.includes("lance") || arg.includes("lcl")) {
          return isUnlocked(seele)
            ? print("SEE FOR YOURSELF. 'open dogma'")
            : print("CLASSIFIED // SEELE CLEARANCE REQUIRED", "err");
        }
        return print(`cat: ${arg}: NO SUCH FILE`, "err");
      }
      case "open":
      case "cd": {
        const report = reports.find((p) => arg === p.file || arg === p.slug);
        if (report) {
          print(`OPENING INCIDENT REPORT // CASE No.${report.file}`, "ok");
          return window.location.assign(reportPath(report));
        }
        const id = { magi: "magi", files: "files", case_files: "files", comms: "comms", dogma: "dogma" }[
          arg.replace(/\/$/, "")
        ];
        if (!id) return print("open: TRY magi, files, comms OR A CASE NUMBER", "err");
        if (id === "dogma" && !isUnlocked(seele)) {
          return print(`HEAVEN'S DOOR IS SEALED. ${sealCount(seele)} OF 7 SEALS BROKEN.`, "err");
        }
        return thenClose(() => goTo(id));
      }
      case "id":
      case "register":
        return thenClose(() => openUi("idcard"));
      case "get":
      case "eva":
      case "robot":
        return thenClose(() => openUi("gendo"));
      case "sdat":
      case "play":
        sdat.play();
        return print("▶ S-DAT // EARPHONES IN", "ok");
      case "stop":
        sdat.stop();
        return print("■ S-DAT // EARPHONES OUT", "ok");
      case "briefing":
        return print(
          `作戦概要 // MISSION BRIEFING // UPDATED ${dotDate(briefing.updated)}\n${briefing.tasks
            .map((t, i) => `OP-${String(i + 1).padStart(2, "0")}  ${t.name.toUpperCase()}  [${t.status}]`)
            .join("\n")}`,
        );
      case "calendar":
        return print(
          upcoming()
            .map((e) => `${e.date}  ${e.en}`)
            .join("\n"),
        );
      case "unit":
      case "theme": {
        const picked = UNITS.find((u) => u.id === arg.replace(/^unit-?/, ""));
        if (!picked) return print("unit: TRY magi, 00, 01 OR 02", "err");
        setUnit(picked.id);
        return print(`${picked.label} COLORS ENGAGED`, "ok");
      }
      case "unplug":
        unplug();
        return print("UMBILICAL CABLE DISCONNECTED // INTERNAL POWER: 5 MINUTES", "err");
      case "plug":
        plugIn();
        return print("UMBILICAL CABLE CONNECTED // EXTERNAL POWER", "ok");
      case "stats": {
        print("QUERYING MAGI…", "sys");
        const count = await fetchAngelCount().catch(() => null);
        return print(count ? `ANGELS REPELLED: ${count}` : "STATS UNAVAILABLE", count ? "ok" : "err");
      }
      case "seele":
        if (arg === "reset --yes") {
          resetSeele();
          return print("THE SCENARIO HAS BEEN RESET.", "ok");
        }
        if (arg === "reset") return print("THIS FORGETS EVERY SEAL. TYPE 'seele reset --yes' TO CONFIRM.", "err");
        return print(seeleReport(seele));
      case "hint": {
        const hint = nextHint();
        return print(hint ? `SEELE: "${hint}"` : 'SEELE: "There is nothing left to find. Congratulations."', "ok");
      }
      case "sound":
        if (arg !== "on" && arg !== "off") return print("sound: on OR off", "err");
        setSound(arg === "on");
        return print(`SOUND ${arg.toUpperCase()}`, "ok");
      case "date":
      case "time": {
        const tokyo = new Date().toLocaleString("en-GB", { timeZone: "Asia/Tokyo", hour12: false });
        const event = todaysEvent();
        return print(
          `TOKYO-3 // ${tokyo} JST // ${timeOfDay().toUpperCase()} WHERE YOU ARE${event ? `\n${event.text}` : ""}`,
        );
      }
      case "sudo":
        return print("MELCHIOR-1 否決 · BALTHASAR-2 否決 · CASPER-3 否決\nREQUEST DENIED. NICE TRY.", "err");
      case "rm":
        return print("SELF-DESTRUCT REQUIRES A UNANIMOUS MAGI VOTE. 0 OF 3.", "err");
      case "instrumentality":
        return print("NOT YET.", "err");
      case "hello":
      case "hi":
        return print("…HELLO, PILOT.");
      case "clear":
      case "cls":
        return setLines([]);
      case "exit":
      case "quit":
        return onClose();
      default:
        return print(`MAGI: '${word}' NOT RECOGNIZED. TYPE 'help'.`, "err");
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const raw = input;
    setInput("");
    print(`MAGI> ${raw}`, "cmd");
    if (raw.trim()) history.current.push(raw);
    cursor.current = history.current.length;
    run(raw);
  };

  // Tab completes the command, or its last argument. With several matches it
  // fills in what they share, and lists them if that's all it can do.
  const complete = () => {
    const parts = input.trimStart().split(/\s+/);
    const options = parts.length === 1 ? COMMANDS : (ARGS[parts[0].toLowerCase()] ?? []);
    const word = parts.at(-1).toLowerCase();
    const matches = options.filter((o) => o.startsWith(word));
    if (!matches.length) return;
    const done = matches.length === 1 ? `${matches[0]} ` : commonPrefix(matches);
    if (done.trim() === word && matches.length > 1) {
      print(`MAGI> ${input}`, "cmd");
      print(matches.join("   "), "sys");
      return;
    }
    setInput([...parts.slice(0, -1), done].join(" "));
  };

  const onKeyDown = (e) => {
    if (e.key === "`") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      cursor.current = Math.min(Math.max(cursor.current + (e.key === "ArrowUp" ? -1 : 1), 0), h.length);
      setInput(h[cursor.current] ?? "");
    }
  };

  return (
    <Modal open onClose={onClose} label="MAGI terminal" className="w-[46rem]">
      <div className="flex items-center justify-between bg-magi px-3 py-1 text-xs tracking-widest text-void">
        <span>MAGI-01 // TERMINAL // 端末</span>
        <button type="button" onClick={onClose} aria-label="Close terminal" className="px-1 hover:text-paper">
          ✕
        </button>
      </div>
      <div
        ref={outRef}
        onClick={() => inputRef.current?.focus()}
        className="h-[55dvh] overflow-y-auto p-3 text-sm leading-relaxed whitespace-pre-wrap"
        aria-live="polite"
      >
        {lines.map((l, i) => (
          <div key={i} className={TONE[l.tone]}>
            {l.text}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t-2 border-magi px-3 py-2 text-sm">
        <label htmlFor="magi-input" className="text-paper">
          MAGI&gt;
        </label>
        <input
          id="magi-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          data-autofocus
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-paper caret-magi outline-none"
        />
      </form>
    </Modal>
  );
}
