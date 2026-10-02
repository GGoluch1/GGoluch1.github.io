import { useEffect, useRef, useState } from "react";
import { profile } from "../data/profile";
import { projects } from "../data/projects";
import { socials } from "../data/socials";
import { PENPEN, SEALS, isUnlocked, nextHint, resetSeele, sealCount, useSeele } from "../lib/eggs";
import { goTo } from "../lib/navigate";
import { fetchAngelCount, fetchNowPlaying, timeAgo } from "../lib/remote";
import { setSound } from "../lib/sound";
import { timeOfDay } from "../lib/tod";
import { openUi } from "../lib/ui";
import Modal from "./Modal";

// A MAGI command line. Open with the ` key, or the button in the footer.

const HELP = `AVAILABLE COMMANDS
  help              this list
  whoami            personnel file
  ls [dir]          list files
  cat <file>        read a file
  open <section>    go to magi, files, comms (cd works too)
  id                issue yourself a NERV ID card
  sdat              what's playing on the S-DAT
  stats             angels repelled so far
  seele             scenario progress
  hint              ask SEELE for guidance
  sound on|off      interface sounds
  date              Tokyo-3 local time
  clear             clear the screen
  exit              close the terminal`;

const WELCOME = [
  { text: "MAGI SYSTEM // 第7世代有機コンピュータ", tone: "sys" },
  { text: "MELCHIOR-1 · BALTHASAR-2 · CASPER-3 ONLINE", tone: "sys" },
  { text: "TYPE 'help' FOR COMMANDS.", tone: "out" },
];

const TONE = {
  cmd: "text-paper",
  out: "text-magi",
  sys: "text-magi/60",
  ok: "text-sync",
  err: "text-nerv",
};

const plain = (blurb) => blurb.replace(/\[\[(.+?)\]\]/g, "$1");

function listing(dir, seele) {
  if (!dir || dir === "/" || dir === "~") {
    return `case_files/   comms/   seele.txt   dogma/${isUnlocked(seele) ? "" : "  [SEALED]"}`;
  }
  if (dir.startsWith("case")) return projects.map((p) => `${p.file}   ${p.title}   [${p.status}]`).join("\n");
  if (dir.startsWith("comms")) return socials.map((s) => `${s.name.padEnd(10)} ${s.url}`).join("\n");
  if (dir.startsWith("dogma")) return isUnlocked(seele) ? "lilith   lance_of_longinus   lcl" : null;
  return undefined;
}

function seeleReport(seele) {
  const rows = SEALS.map((s, i) => {
    const broken = seele.found.has(s.id);
    return `SEAL ${i + 1}  ${broken ? "◉" : "○"}  ${broken ? s.name : "??????"}`;
  });
  if (seele.found.has(PENPEN.id)) rows.push("BONUS   ◉  PEN PEN");
  return `THE SCENARIO // ${sealCount(seele)} OF 7 SEALS BROKEN\n${rows.join("\n")}`;
}

export default function Terminal({ onClose }) {
  const seele = useSeele();
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
            `CASE No.${p.file} // ${p.title} // ${p.year}\n${plain(p.blurb)}\nTAGS: ${p.tags.join(", ")}\nSTATUS: ${p.status}${p.repo ? `\nSOURCE: ${p.repo}` : ""}${p.live ? `\nDEPLOY: ${p.live}` : ""}`,
          );
        }
        if (arg.includes("lilith") || arg.includes("lance") || arg.includes("lcl")) {
          return isUnlocked(seele) ? print("SEE FOR YOURSELF. 'open dogma'") : print("CLASSIFIED // SEELE CLEARANCE REQUIRED", "err");
        }
        return print(`cat: ${arg}: NO SUCH FILE`, "err");
      }
      case "open":
      case "cd": {
        const id = { magi: "magi", files: "files", case_files: "files", comms: "comms", dogma: "dogma" }[arg.replace(/\/$/, "")];
        if (!id) return print("open: TRY magi, files OR comms", "err");
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
      case "np": {
        print("QUERYING S-DAT…", "sys");
        const np = await fetchNowPlaying().catch(() => null);
        if (!np) return print("TRACK 25 ⇄ TRACK 26 // NO SIGNAL");
        return print(`${np.playing ? "▶ NOW PLAYING" : `■ LAST PLAYED ${np.at ? timeAgo(np.at) : ""}`}\n${np.title} — ${np.artist}`);
      }
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
        return print(hint ? `SEELE: "${hint}"` : "SEELE: \"There is nothing left to find. Congratulations.\"", "ok");
      }
      case "sound":
        if (arg !== "on" && arg !== "off") return print("sound: on OR off", "err");
        setSound(arg === "on");
        return print(`SOUND ${arg.toUpperCase()}`, "ok");
      case "date":
      case "time": {
        const tokyo = new Date().toLocaleString("en-GB", { timeZone: "Asia/Tokyo", hour12: false });
        return print(`TOKYO-3 // ${tokyo} JST // ${timeOfDay().toUpperCase()} WHERE YOU ARE`);
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

  const onKeyDown = (e) => {
    if (e.key === "`") {
      e.preventDefault();
      onClose();
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
