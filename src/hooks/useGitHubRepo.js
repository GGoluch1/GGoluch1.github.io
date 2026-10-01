import { useEffect, useState } from "react";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relative(iso) {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (Math.abs(days) < 1) return "today";
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
}

// Fetches public stats for "owner/name" from the GitHub API.
// Results are cached for the tab session to stay well under the rate limit
// (60 requests/hour per visitor). Returns null while loading or on failure.
export function useGitHubRepo(repo) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!repo) return;
    const key = `gh:${repo}`;
    let cancelled = false;

    const apply = (json) => {
      if (cancelled) return;
      setData({
        stars: json.stargazers_count,
        language: json.language,
        pushed: relative(json.pushed_at),
      });
    };

    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        apply(JSON.parse(cached));
        return () => {
          cancelled = true;
        };
      }
    } catch {
      // storage blocked: just fetch
    }

    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((json) => {
        const slim = {
          stargazers_count: json.stargazers_count,
          language: json.language,
          pushed_at: json.pushed_at,
        };
        try {
          sessionStorage.setItem(key, JSON.stringify(slim));
        } catch {
          // ignore
        }
        apply(slim);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [repo]);

  return data;
}
