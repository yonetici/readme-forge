import type { ProfileData } from "./types";
import { findSkill } from "@/data/skills";
import { SOCIAL_PLATFORMS } from "@/data/socials";
import { resolveCards } from "./statsCards";

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
    // In durable mode the README points at committed files — except in the
    // preview, where we show the live image so the user can actually see it.
    const src = (c: (typeof cards)[number]) =>
      durable && !opts.forPreview ? c.committedPath : c.liveUrl;

    const rows = cards
      .map((c) => `<img src="${src(c)}" alt="${c.panel.label}" ${c.panel.fullWidth ? "" : 'height="165" '}/>`)
      .join("\n");
    out.push(`<h3 align="left">📊 GitHub Stats</h3>\n<p align="left">\n${rows}\n</p>`);

    if (durable && !opts.forPreview) {
      out.push(
        `<!-- Stat cards above are committed to ./assets by .github/workflows/update-stats.yml\n     (included in your README Forge download). They refresh daily and keep working\n     even when the upstream services are down. -->`
      );
    }
  }

  return out.join("\n\n") + "\n";
}

export function generateStatsWorkflow(p: ProfileData): string {
  const user = p.githubUsername.trim() || "YOUR_USERNAME";
  const cards = resolveCards(user, p.addons.statsTheme, p.addons.panels);
  const fetches = cards
    .map((c) => `          fetch "${c.liveUrl}" "assets/${c.panel.file}"`)
    .join("\n");

  return `name: Update profile stats

# Fetches your stat cards once a day and commits them to ./assets, so your
# README serves durable copies instead of hotlinking shared services on every
# view. A failed fetch keeps the previous card, so your profile never breaks
# even when the upstream service is rate-limited or down.
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

      - name: Fetch stat cards
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
${fetches}

      - name: Commit refreshed cards
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

function stripProtocol(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
