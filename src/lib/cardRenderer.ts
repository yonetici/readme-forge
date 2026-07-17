import type { ThemeColors } from "@/data/statsThemes";
import { languageColor } from "@/data/languageColors";

// README Forge's own SVG stat cards. No third-party render service: given a
// data object and a theme, these produce a self-contained SVG string that is
// committed to the user's repo by the workflow (and previewed live in-app).

export interface StatsData {
  login: string;
  name: string;
  stars: number;
  repos: number;
  followers: number;
  forks: number;
}

export interface LangDatum {
  name: string;
  percent: number; // 0..100
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(n);
}

const W = 480;
const H = 195;

export function renderStatsCard(data: StatsData, c: ThemeColors): string {
  const title = esc(`${data.name || data.login}'s GitHub Stats`);
  const rows: { icon: string; label: string; value: number }[] = [
    { icon: "⭐", label: "Total Stars Earned", value: data.stars },
    { icon: "📦", label: "Public Repositories", value: data.repos },
    { icon: "👥", label: "Followers", value: data.followers },
    { icon: "🍴", label: "Total Forks", value: data.forks },
  ];
  const rowSvg = rows
    .map((r, i) => {
      const y = 74 + i * 28;
      return `    <text x="30" y="${y}" font-size="15" fill="${c.text}">${r.icon}</text>
    <text x="56" y="${y}" font-size="14" fill="${c.text}">${esc(r.label)}</text>
    <text x="${W - 30}" y="${y}" font-size="14" font-weight="700" fill="${c.icon}" text-anchor="end">${fmt(r.value)}</text>`;
    })
    .join("\n");

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${c.bg}" stroke="${c.border}"/>
  <text x="30" y="38" font-size="18" font-weight="700" fill="${c.title}" font-family="'Segoe UI',Ubuntu,sans-serif">${title}</text>
  <line x1="30" y1="50" x2="${W - 30}" y2="50" stroke="${c.border}"/>
  <g font-family="'Segoe UI',Ubuntu,sans-serif">
${rowSvg}
  </g>
</svg>`;
}

/** Placeholder committed for third-party cards so the README shows something
 *  tidy (not a broken image) until the workflow's first run replaces it. */
export function renderPlaceholderCard(label: string, c: ThemeColors): string {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}">
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${c.bg}" stroke="${c.border}"/>
  <text x="${W / 2}" y="${H / 2 - 6}" font-size="16" font-weight="700" fill="${c.title}" text-anchor="middle" font-family="'Segoe UI',Ubuntu,sans-serif">${esc(label)}</text>
  <text x="${W / 2}" y="${H / 2 + 18}" font-size="12" fill="${c.text}" text-anchor="middle" font-family="'Segoe UI',Ubuntu,sans-serif">Populates on the first workflow run</text>
</svg>`;
}

export function renderTopLangsCard(langs: LangDatum[], c: ThemeColors): string {
  const top = langs.slice(0, 6);
  const barX = 30;
  const barW = W - 60;
  const rows = top
    .map((l, i) => {
      const y = 74 + i * 24;
      const w = Math.max(2, Math.round((l.percent / 100) * barW));
      const col = languageColor(l.name);
      return `    <text x="${barX}" y="${y - 6}" font-size="13" fill="${c.text}" font-family="'Segoe UI',Ubuntu,sans-serif">${esc(l.name)}</text>
    <text x="${W - 30}" y="${y - 6}" font-size="12" fill="${c.text}" text-anchor="end" font-family="'Segoe UI',Ubuntu,sans-serif">${l.percent.toFixed(1)}%</text>
    <rect x="${barX}" y="${y - 2}" width="${barW}" height="8" rx="4" fill="${c.border}"/>
    <rect x="${barX}" y="${y - 2}" width="${w}" height="8" rx="4" fill="${col}"/>`;
    })
    .join("\n");

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Most Used Languages">
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${c.bg}" stroke="${c.border}"/>
  <text x="30" y="38" font-size="18" font-weight="700" fill="${c.title}" font-family="'Segoe UI',Ubuntu,sans-serif">Most Used Languages</text>
  <line x1="30" y1="50" x2="${W - 30}" y2="50" stroke="${c.border}"/>
${rows}
</svg>`;
}
