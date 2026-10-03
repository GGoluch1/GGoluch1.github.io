// Live data from outside services. Returns null when not configured or when
// the service can't be reached, and the UI hides.
// Every result is cached for the tab session, to stay well under GitHub's
// rate limit (60 requests an hour per visitor).

import { site } from "../data/site";
import { session } from "./storage";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

// Runs `load` once per tab session and remembers its (JSON) result.
// Anything unreadable in storage (say, a format an older version wrote) is
// simply fetched again.
async function cached(key, load) {
  const saved = session.get(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fall through and fetch
    }
  }
  const value = await load();
  if (value != null) session.set(key, JSON.stringify(value));
  return value;
}

// Total visitors from GoatCounter, shown as "Angels repelled".
// Switched on by site.angelCounter (see src/data/site.js).
export async function fetchAngelCount() {
  if (!site.goatcounter || !site.angelCounter) return null;
  return cached("magi-angels", async () => {
    const json = await getJson(`https://${site.goatcounter}.goatcounter.com/counter/TOTAL.json`);
    return json?.count || null;
  });
}

// The MAGI activity log: recent public commits, newest first, as
// [{ repo, sha, message, date }]. GitHub's events API only says which repos
// were pushed to, so the messages come from each of those repos' commits.
export async function fetchActivity(limit = 5) {
  const user = site.github;
  if (!user) return null;
  return cached(`magi-activity:${user}`, async () => {
    const events = await getJson(`https://api.github.com/users/${user}/events/public?per_page=50`);
    const repos = [...new Set(events.filter((e) => e.type === "PushEvent").map((e) => e.repo.name))].slice(0, 3);
    const lists = await Promise.all(
      repos.map((repo) =>
        getJson(`https://api.github.com/repos/${repo}/commits?per_page=${limit}&author=${user}`)
          .then((commits) =>
            commits.map((c) => ({
              repo,
              sha: c.sha.slice(0, 7),
              message: c.commit.message.split("\n")[0],
              date: c.commit.author.date,
            })),
          )
          .catch(() => []),
      ),
    );
    return lists
      .flat()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  });
}

// Public stats for a GitHub repo ("owner/name"), for the case files.
export async function fetchRepo(repo) {
  if (!repo) return null;
  return cached(`magi-repo:${repo}`, async () => {
    const json = await getJson(`https://api.github.com/repos/${repo}`);
    return { stars: json.stargazers_count, language: json.language, pushedAt: json.pushed_at };
  });
}
