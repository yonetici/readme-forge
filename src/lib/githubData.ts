import type { StatsData, LangDatum } from "./cardRenderer";

// Client-side data fetch for the in-app preview, using GitHub's public REST API
// (CORS-enabled, no token; 60 req/hr per viewer IP — fine for a preview). The
// workflow uses the same shapes with an authenticated request for accuracy.

interface Repo {
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

export interface CardData {
  stats: StatsData;
  langs: LangDatum[];
  sample: boolean;
}

export async function fetchCardData(user: string): Promise<CardData> {
  try {
    const uRes = await fetch(`https://api.github.com/users/${user}`);
    if (!uRes.ok) throw new Error(String(uRes.status));
    const u = await uRes.json();

    const repos: Repo[] = [];
    for (let page = 1; page <= 3; page++) {
      const rRes = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&page=${page}&sort=pushed`);
      if (!rRes.ok) break;
      const batch: Repo[] = await rRes.json();
      repos.push(...batch);
      if (batch.length < 100) break;
    }

    const owned = repos.filter((r) => !r.fork);
    const stars = owned.reduce((s, r) => s + r.stargazers_count, 0);
    const forks = owned.reduce((s, r) => s + r.forks_count, 0);

    const tally = new Map<string, number>();
    for (const r of owned) if (r.language) tally.set(r.language, (tally.get(r.language) ?? 0) + 1);
    const total = [...tally.values()].reduce((a, b) => a + b, 0) || 1;
    const langs: LangDatum[] = [...tally.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, percent: (count / total) * 100 }));

    return {
      stats: { login: u.login, name: u.name ?? u.login, stars, repos: u.public_repos ?? owned.length, followers: u.followers ?? 0, forks },
      langs,
      sample: false,
    };
  } catch {
    return { ...sampleData(user), sample: true };
  }
}

function sampleData(user: string): Omit<CardData, "sample"> {
  return {
    stats: { login: user, name: user, stars: 1280, repos: 42, followers: 530, forks: 210 },
    langs: [
      { name: "TypeScript", percent: 34 },
      { name: "Python", percent: 26 },
      { name: "JavaScript", percent: 18 },
      { name: "Go", percent: 12 },
      { name: "CSS", percent: 10 },
    ],
  };
}
