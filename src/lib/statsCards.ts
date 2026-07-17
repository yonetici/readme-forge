import { getTheme } from "@/data/statsThemes";

export type PanelId = "stats" | "topLangs" | "streak" | "activity" | "trophies";

export interface StatsPanel {
  id: PanelId;
  label: string;
  hint: string;
  /** Committed filename used in durable mode. */
  file: string;
  /** Live card URL, also fetched by the durable workflow. */
  url: (user: string, themeId: string) => string;
  /** Wide cards look best on their own row in the README. */
  fullWidth: boolean;
  /** README Forge renders this card itself (no third-party service) in durable
   *  mode; the others are cached copies of third-party cards. */
  native: boolean;
}

const GRS = "https://github-readme-stats.vercel.app";

export const STATS_PANELS: StatsPanel[] = [
  {
    id: "stats",
    label: "Overall stats",
    hint: "Stars, repos, followers, forks — rendered by README Forge itself",
    file: "github-stats.svg",
    fullWidth: false,
    native: true,
    url: (u, t) =>
      `${GRS}/api?username=${u}&show_icons=true&include_all_commits=true&count_private=true&theme=${t}`,
  },
  {
    id: "topLangs",
    label: "Top languages",
    hint: "Most-used languages — rendered by README Forge itself",
    file: "top-langs.svg",
    fullWidth: false,
    native: true,
    url: (u, t) => `${GRS}/api/top-langs?username=${u}&layout=compact&langs_count=8&theme=${t}`,
  },
  {
    id: "streak",
    label: "Streak",
    hint: "Current and longest contribution streak",
    file: "streak.svg",
    fullWidth: true,
    native: false,
    url: (u, t) => `https://streak-stats.demolab.com?user=${u}&theme=${t}`,
  },
  {
    id: "activity",
    label: "Activity graph",
    hint: "Contribution trend over the last months",
    file: "activity-graph.svg",
    fullWidth: true,
    native: false,
    url: (u, t) =>
      `https://github-readme-activity-graph.vercel.app/graph?username=${u}&theme=${getTheme(t).activity}&hide_border=true`,
  },
  {
    id: "trophies",
    label: "Trophies",
    hint: "Achievement badges for your GitHub milestones",
    file: "trophies.svg",
    fullWidth: true,
    native: false,
    url: (u, t) =>
      `https://github-profile-trophy.vercel.app?username=${u}&theme=${getTheme(t).trophy}&no-frame=true&column=7&margin-w=4`,
  },
];

export function panelById(id: PanelId): StatsPanel {
  return STATS_PANELS.find((p) => p.id === id)!;
}

export interface ResolvedCard {
  panel: StatsPanel;
  /** Live URL (used for hotlink markdown and for the in-app preview). */
  liveUrl: string;
  /** Repo-relative path used by durable markdown. */
  committedPath: string;
}

export function resolveCards(user: string, themeId: string, enabled: PanelId[]): ResolvedCard[] {
  return STATS_PANELS.filter((p) => enabled.includes(p.id)).map((panel) => ({
    panel,
    liveUrl: panel.url(user, themeId),
    committedPath: `./assets/${panel.file}`,
  }));
}
