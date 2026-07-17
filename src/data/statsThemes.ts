// Theme names diverge across the stat-card services, so each entry carries the
// per-service token. `dark` drives which services need a light/dark variant and
// how the in-app preview frames the card.
export interface StatsTheme {
  id: string; // github-readme-stats + streak-stats token
  label: string;
  dark: boolean;
  trophy: string; // github-profile-trophy token
  activity: string; // github-readme-activity-graph token
}

export const STATS_THEMES: StatsTheme[] = [
  { id: "tokyonight", label: "Tokyo Night", dark: true, trophy: "tokyonight", activity: "tokyo-night" },
  { id: "dark", label: "Dark", dark: true, trophy: "darkhub", activity: "github-compact" },
  { id: "radical", label: "Radical", dark: true, trophy: "radical", activity: "react-dark" },
  { id: "dracula", label: "Dracula", dark: true, trophy: "dracula", activity: "dracula" },
  { id: "gruvbox", label: "Gruvbox", dark: true, trophy: "gruvbox", activity: "github-compact" },
  { id: "onedark", label: "One Dark", dark: true, trophy: "onedark", activity: "github-compact" },
  { id: "merko", label: "Merko", dark: true, trophy: "green", activity: "github-compact" },
  { id: "cobalt", label: "Cobalt", dark: true, trophy: "algolia", activity: "react-dark" },
  { id: "default", label: "Light", dark: false, trophy: "flat", activity: "github-light" },
];

export function getTheme(id: string): StatsTheme {
  return STATS_THEMES.find((t) => t.id === id) ?? STATS_THEMES[0];
}
