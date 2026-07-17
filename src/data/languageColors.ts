// GitHub's canonical language colors (subset of linguist). Used by our own
// top-languages card so we don't depend on a third-party renderer.
export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Shell: "#89e051",
  "Jupyter Notebook": "#DA5B0B",
  Dockerfile: "#384d54",
  Lua: "#000080",
  "Objective-C": "#438eff",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  R: "#198CE7",
  MATLAB: "#e16737",
  Perl: "#0298c3",
  Astro: "#ff5a03",
  Svelte: "#ff3e00",
};

export function languageColor(name: string): string {
  return LANGUAGE_COLORS[name] ?? "#858585";
}
