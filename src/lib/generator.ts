import type { ProfileData } from "./types";
import { findSkill } from "@/data/skills";
import { SOCIAL_PLATFORMS } from "@/data/socials";
import { resolveCards } from "./statsCards";
import { getTheme } from "@/data/statsThemes";
import { LANGUAGE_COLORS } from "@/data/languageColors";

export interface GenerateOptions {
  /** When true, stat cards use live URLs so the in-app preview shows real
   *  images even in durable mode (where the README points at ./assets). */
  forPreview?: boolean;
}

export function generateReadme(p: ProfileData, opts: GenerateOptions = {}): string {
  const out: string[] = [];
  const user = p.githubUsername.trim();

  if (p.name) {
    out.push(`<h1 align="center">Hi 👋, I'm ${p.name}</h1>`);
  }
  if (p.tagline) {
    out.push(`<h3 align="center">${p.tagline}</h3>`);
  }
  if (p.addons.visitorBadge && user) {
    out.push(
      `<p align="center"><img src="https://komarev.com/ghpvc/?username=${user}&label=Profile%20views&color=0e75b6&style=flat" alt="${user}" /></p>`
    );
  }

  const about: string[] = [];
  if (p.currentWork) {
    const link = p.currentWorkLink ? ` [${p.currentWork}](${p.currentWorkLink})` : ` **${p.currentWork}**`;
    about.push(`- 🔭 I’m currently working on${link}`);
  }
  if (p.learning) about.push(`- 🌱 I’m currently learning **${p.learning}**`);
  if (p.askMeAbout) about.push(`- 💬 Ask me about **${p.askMeAbout}**`);
  if (p.portfolio) about.push(`- 👨‍💻 Check out my work at [${stripProtocol(p.portfolio)}](${p.portfolio})`);
  if (p.blog) about.push(`- 📝 I write articles on [${stripProtocol(p.blog)}](${p.blog})`);
  if (p.email) about.push(`- 📫 How to reach me: **${p.email}**`);
  if (p.funFact) about.push(`- ⚡ Fun fact: **${p.funFact}**`);
  if (about.length) out.push(about.join("\n"));

  const socialEntries = SOCIAL_PLATFORMS.filter((s) => p.socials[s.id]?.trim());
  if (socialEntries.length) {
    const badges = socialEntries
      .map((s) => {
        const value = p.socials[s.id].trim();
        const url = `${s.urlPrefix}${value}`;
        const badge = `https://img.shields.io/badge/${encodeURIComponent(s.label.replace(/-/g, "--"))}-${s.badgeColor}?style=for-the-badge&logo=${s.badgeLogo}&logoColor=white`;
        return `<a href="${url}" target="_blank"><img src="${badge}" alt="${s.label}" /></a>`;
      })
      .join("\n");
    out.push(`<h3 align="left">Connect with me</h3>\n<p align="left">\n${badges}\n</p>`);
  }

  if (p.skills.length) {
    const icons = p.skills
      .map((id) => findSkill(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map(
        (s) =>
          `<a href="${s.docUrl}" target="_blank" rel="noreferrer"><img src="${s.iconUrl}" alt="${s.label}" width="40" height="40" /></a>`
      )
      .join("\n");
    out.push(`<h3 align="left">Languages and Tools</h3>\n<p align="left">\n${icons}\n</p>`);
  }

  if (user && p.addons.panels.length) {
    const durable = p.addons.statsEngine === "durable";
    const cards = resolveCards(user, p.addons.statsTheme, p.addons.panels);
    // Live mode hotlinks third-party cards. Durable points the README at
    // committed files; in preview we swap third-party cards for their live URL
    // so they're visible, but keep native cards on their ./assets path so the
    // preview renders README Forge's own card instead of a third-party one.
    const src = (c: (typeof cards)[number]) => {
      if (!durable) return c.liveUrl;
      if (c.panel.native) return c.committedPath;
      return opts.forPreview ? c.liveUrl : c.committedPath;
    };

    const rows = cards
      .map((c) => `<img src="${src(c)}" alt="${c.panel.label}" ${c.panel.fullWidth ? "" : 'height="165" '}/>`)
      .join("\n");
    out.push(`<h3 align="left">📊 GitHub Stats</h3>\n<p align="left">\n${rows}\n</p>`);

    if (durable && !opts.forPreview) {
      out.push(
        `<!-- Stat cards above are committed to ./assets and refreshed daily by\n     .github/workflows/update-stats.yml (included in your README Forge download).\n     The Overall-stats and Top-languages cards are rendered by README Forge's own\n     scripts/generate-cards.mjs — no third-party render service at all. -->`
      );
    }
  }

  return out.join("\n\n") + "\n";
}

export function hasNativePanels(p: ProfileData): boolean {
  return resolveCards(p.githubUsername.trim() || "u", p.addons.statsTheme, p.addons.panels).some(
    (c) => c.panel.native
  );
}

export function generateSetupDoc(p: ProfileData): string {
  const user = p.githubUsername.trim() || "YOUR_USERNAME";
  const hasStats = user && p.addons.panels.length && p.addons.statsEngine === "durable";
  return `# Setup

This bundle is ready to commit to your GitHub **profile repository** — the one
named exactly after your username (\`${user}/${user}\`). Unzip it at the root of
that repo so the layout looks like:

\`\`\`
${user}/
├── README.md
${hasStats ? "├── .github/\n│   └── workflows/\n│       └── update-stats.yml\n" : ""}${hasStats && hasNativePanels(p) ? "├── scripts/\n│   └── generate-cards.mjs\n" : ""}${hasStats ? "└── assets/\n    └── *.svg   ← your stat cards (already rendered, so the README works now)\n" : ""}\`\`\`

## Steps

1. **Commit everything.** The \`assets/*.svg\` files are already rendered, so your
   README displays correctly the moment you push — no waiting.
${
  hasStats
    ? `2. **Enable the daily refresh.** Go to your repo's **Actions** tab, enable
   workflows if prompted, open **"Update profile stats"**, and click **Run
   workflow** once. After that it runs automatically every day at 03:00 UTC and
   keeps your cards up to date${hasNativePanels(p) ? " — rendering Overall-stats and Top-languages itself, with no third-party service" : ""}.
`
    : ""
}
## Heads up

Do **not** paste \`README.md\` into a repo without also committing the \`assets/\`
folder — the stat cards use relative paths like \`./assets/github-stats.svg\`, so
the images only resolve when those files are committed alongside the README.

If you'd rather just copy-paste a README with no files to manage, re-generate it
in **Live** mode instead — that version hotlinks the cards directly (at the cost
of the rate limits and outages the durable mode avoids).
`;
}

export function generateStatsWorkflow(p: ProfileData): string {
  const cards = resolveCards(p.githubUsername.trim() || "YOUR_USERNAME", p.addons.statsTheme, p.addons.panels);
  const nativeCards = cards.filter((c) => c.panel.native);
  const thirdParty = cards.filter((c) => !c.panel.native);

  const nativeStep = nativeCards.length
    ? `      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Render README Forge stat cards (no third-party service)
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: node scripts/generate-cards.mjs

`
    : "";

  const fetchStep = thirdParty.length
    ? `      - name: Fetch third-party cards
        run: |
          mkdir -p assets
          fetch() {
            tmp="$(mktemp)"
            code="$(curl -sL --max-time 30 -w '%{http_code}' -o "$tmp" "$1")"
            if [ "$code" = "200" ] && head -c 256 "$tmp" | grep -qiE '<svg|<\\?xml'; then
              mv "$tmp" "$2"
              echo "updated $2"
            else
              echo "skip $2 (HTTP $code) — keeping previous copy"
              rm -f "$tmp"
            fi
          }
${thirdParty.map((c) => `          fetch "${c.liveUrl}" "assets/${c.panel.file}"`).join("\n")}

`
    : "";

  return `name: Update profile stats

# Refreshes your stat cards once a day and commits them to ./assets, so your
# README serves durable copies instead of hotlinking services on every view.
#  - Overall stats & Top languages are rendered by scripts/generate-cards.mjs
#    from the GitHub API directly — no third-party render service involved.
#  - Any other cards are fetched once/day; a failed fetch keeps the previous
#    copy, so your profile never breaks when an upstream service is down.
on:
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  refresh-stats:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

${nativeStep}${fetchStep}      - name: Commit refreshed cards
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add assets/*.svg
          if git diff --quiet --cached; then
            echo "No changes"
          else
            git commit -m "chore: refresh profile stat cards"
            git push
          fi
`;
}

/**
 * A dependency-free Node script (committed to the user's repo) that fetches
 * their GitHub data via the authenticated REST API and renders README Forge's
 * own SVG cards — the whole point being zero third-party render services.
 * The card layout mirrors src/lib/cardRenderer.ts so preview and output match.
 */
export function generateCardScript(p: ProfileData): string {
  const user = p.githubUsername.trim() || "YOUR_USERNAME";
  const c = getTheme(p.addons.statsTheme).colors;
  const cards = resolveCards(user, p.addons.statsTheme, p.addons.panels);
  const wantStats = cards.some((x) => x.panel.id === "stats");
  const wantLangs = cards.some((x) => x.panel.id === "topLangs");

  return `// Generated by README Forge — renders your GitHub stat cards with no
// third-party render service. Requires Node 18+ (global fetch). Run in CI with
// GH_TOKEN set; the included workflow does this for you.
import { writeFileSync, mkdirSync } from "node:fs";

const USER = ${JSON.stringify(user)};
const COLORS = ${JSON.stringify(c)};
const LANG_COLORS = ${JSON.stringify(LANGUAGE_COLORS)};
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
const H = { "User-Agent": "readme-forge", ...(TOKEN ? { Authorization: "Bearer " + TOKEN } : {}) };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\\.0$/, "") + "k" : String(n));
const W = 480, HT = 195;

async function getData() {
  const u = await (await fetch("https://api.github.com/users/" + USER, { headers: H })).json();
  const repos = [];
  for (let page = 1; page <= 4; page++) {
    const b = await (await fetch("https://api.github.com/users/" + USER + "/repos?per_page=100&page=" + page, { headers: H })).json();
    if (!Array.isArray(b) || !b.length) break;
    repos.push(...b);
    if (b.length < 100) break;
  }
  const owned = repos.filter((r) => !r.fork);
  const stars = owned.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const forks = owned.reduce((s, r) => s + (r.forks_count || 0), 0);
  const tally = {};
  for (const r of owned) if (r.language) tally[r.language] = (tally[r.language] || 0) + 1;
  const total = Object.values(tally).reduce((a, b) => a + b, 0) || 1;
  const langs = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, count]) => ({ name, percent: (count / total) * 100 }));
  return {
    stats: { login: u.login, name: u.name || u.login, stars, repos: u.public_repos || owned.length, followers: u.followers || 0, forks },
    langs,
  };
}

function statsCard(d) {
  const title = esc((d.name || d.login) + "'s GitHub Stats");
  const rows = [
    ["⭐", "Total Stars Earned", d.stars],
    ["📦", "Public Repositories", d.repos],
    ["👥", "Followers", d.followers],
    ["🍴", "Total Forks", d.forks],
  ].map(([icon, label, value], i) => {
    const y = 74 + i * 28;
    return \`    <text x="30" y="\${y}" font-size="15" fill="\${COLORS.text}">\${icon}</text>
    <text x="56" y="\${y}" font-size="14" fill="\${COLORS.text}">\${esc(label)}</text>
    <text x="\${W - 30}" y="\${y}" font-size="14" font-weight="700" fill="\${COLORS.icon}" text-anchor="end">\${fmt(value)}</text>\`;
  }).join("\\n");
  return \`<svg width="\${W}" height="\${HT}" viewBox="0 0 \${W} \${HT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="\${title}">
  <rect x="0.5" y="0.5" width="\${W - 1}" height="\${HT - 1}" rx="10" fill="\${COLORS.bg}" stroke="\${COLORS.border}"/>
  <text x="30" y="38" font-size="18" font-weight="700" fill="\${COLORS.title}" font-family="'Segoe UI',Ubuntu,sans-serif">\${title}</text>
  <line x1="30" y1="50" x2="\${W - 30}" y2="50" stroke="\${COLORS.border}"/>
  <g font-family="'Segoe UI',Ubuntu,sans-serif">
\${rows}
  </g>
</svg>\`;
}

function langsCard(langs) {
  const barX = 30, barW = W - 60;
  const rows = langs.slice(0, 6).map((l, i) => {
    const y = 74 + i * 24;
    const w = Math.max(2, Math.round((l.percent / 100) * barW));
    const col = LANG_COLORS[l.name] || "#858585";
    return \`    <text x="\${barX}" y="\${y - 6}" font-size="13" fill="\${COLORS.text}" font-family="'Segoe UI',Ubuntu,sans-serif">\${esc(l.name)}</text>
    <text x="\${W - 30}" y="\${y - 6}" font-size="12" fill="\${COLORS.text}" text-anchor="end" font-family="'Segoe UI',Ubuntu,sans-serif">\${l.percent.toFixed(1)}%</text>
    <rect x="\${barX}" y="\${y - 2}" width="\${barW}" height="8" rx="4" fill="\${COLORS.border}"/>
    <rect x="\${barX}" y="\${y - 2}" width="\${w}" height="8" rx="4" fill="\${col}"/>\`;
  }).join("\\n");
  return \`<svg width="\${W}" height="\${HT}" viewBox="0 0 \${W} \${HT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Most Used Languages">
  <rect x="0.5" y="0.5" width="\${W - 1}" height="\${HT - 1}" rx="10" fill="\${COLORS.bg}" stroke="\${COLORS.border}"/>
  <text x="30" y="38" font-size="18" font-weight="700" fill="\${COLORS.title}" font-family="'Segoe UI',Ubuntu,sans-serif">Most Used Languages</text>
  <line x1="30" y1="50" x2="\${W - 30}" y2="50" stroke="\${COLORS.border}"/>
\${rows}
</svg>\`;
}

const data = await getData();
mkdirSync("assets", { recursive: true });
${wantStats ? `writeFileSync("assets/github-stats.svg", statsCard(data.stats));\nconsole.log("wrote assets/github-stats.svg");` : ""}
${wantLangs ? `writeFileSync("assets/top-langs.svg", langsCard(data.langs));\nconsole.log("wrote assets/top-langs.svg");` : ""}
`;
}

function stripProtocol(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
