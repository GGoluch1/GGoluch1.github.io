import { profile } from "../data/profile";
import Reveal from "./Reveal";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer>
      <div className="hazard h-4" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <Reveal variant="wipe">
          <p className="mx-auto w-fit font-title text-2xl font-black text-paper transition hover:animate-glitch md:text-3xl">
            GOD&apos;S IN HIS HEAVEN.
            <br />
            ALL&apos;S RIGHT WITH THE WORLD.
          </p>
        </Reveal>
        <Reveal variant="fade" delay={300}>
          <p className="mt-6 text-xs text-magi/60">
            © {YEAR} {profile.firstName} {profile.lastName} // NERV HQ, TOKYO-3
          </p>
          <p className="mt-2 text-[10px] text-magi/40">
            Fan-made tribute. Neon Genesis Evangelion belongs to its respective owners.
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
