// Theme names diverge across the stat-card services, so each entry carries the
// per-service token. `dark` drives which services need a light/dark variant and
// how the in-app preview frames the card. `colors` drives README Forge's OWN
// self-rendered cards (no third-party render service).
export interface ThemeColors {
  bg: string;
  title: string;
  text: string;
  icon: string;
  border: string;
}

export interface StatsTheme {
  id: string; // github-readme-stats + streak-stats token
  label: string;
  dark: boolean;
  trophy: string; // github-profile-trophy token
  activity: string; // github-readme-activity-graph token
  colors: ThemeColors;
}

export const STATS_THEMES: StatsTheme[] = [
  { id: "tokyonight", label: "Tokyo Night", dark: true, trophy: "tokyonight", activity: "tokyo-night", colors: { bg: "#1a1b27", title: "#70a5fd", text: "#a9b1d6", icon: "#bf91f3", border: "#2e3440" } },
  { id: "dark", label: "Dark", dark: true, trophy: "darkhub", activity: "github-compact", colors: { bg: "#151515", title: "#fe428e", text: "#9f9f9f", icon: "#79ff97", border: "#333333" } },
  { id: "radical", label: "Radical", dark: true, trophy: "radical", activity: "react-dark", colors: { bg: "#141321", title: "#fe428e", text: "#a9fef7", icon: "#f8d847", border: "#292040" } },
  { id: "dracula", label: "Dracula", dark: true, trophy: "dracula", activity: "dracula", colors: { bg: "#282a36", title: "#ff6e96", text: "#f8f8f2", icon: "#79dafa", border: "#44475a" } },
  { id: "gruvbox", label: "Gruvbox", dark: true, trophy: "gruvbox", activity: "github-compact", colors: { bg: "#282828", title: "#fabd2f", text: "#8ec07c", icon: "#fe8019", border: "#3c3836" } },
  { id: "onedark", label: "One Dark", dark: true, trophy: "onedark", activity: "github-compact", colors: { bg: "#282c34", title: "#e4bf7a", text: "#abb2bf", icon: "#8db9e2", border: "#3b4048" } },
  { id: "merko", label: "Merko", dark: true, trophy: "green", activity: "github-compact", colors: { bg: "#0a0f0b", title: "#abd200", text: "#68b587", icon: "#b7d364", border: "#2b3c34" } },
  { id: "cobalt", label: "Cobalt", dark: true, trophy: "algolia", activity: "react-dark", colors: { bg: "#193549", title: "#e683d9", text: "#75eeb2", icon: "#0480ef", border: "#1c4966" } },
  { id: "default", label: "Light", dark: false, trophy: "flat", activity: "github-light", colors: { bg: "#fffefe", title: "#2f80ed", text: "#434d58", icon: "#4c71f2", border: "#e4e2e2" } },
];

export function getTheme(id: string): StatsTheme {
  return STATS_THEMES.find((t) => t.id === id) ?? STATS_THEMES[0];
}
