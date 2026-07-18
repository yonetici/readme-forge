import type { ProfileData } from "./types";
import { generateReadme, generateStatsWorkflow, generateCardScript, generateSetupDoc, hasNativePanels } from "./generator";
import { resolveCards } from "./statsCards";
import { getTheme } from "@/data/statsThemes";
import { renderStatsCard, renderTopLangsCard, renderPlaceholderCard } from "./cardRenderer";
import { fetchCardData } from "./githubData";
import type { ZipEntry } from "./zip";

/**
 * Assembles the full set of files for a durable profile (README, workflow,
 * card script, and pre-rendered asset SVGs), shared by both the .zip download
 * and the one-click GitHub publish so they can't drift apart.
 */
export async function buildProfileFiles(p: ProfileData): Promise<ZipEntry[]> {
  const user = p.githubUsername.trim();
  const files: ZipEntry[] = [
    { path: "README.md", content: generateReadme(p) },
    { path: "SETUP.md", content: generateSetupDoc(p) },
    { path: ".github/workflows/update-stats.yml", content: generateStatsWorkflow(p) },
  ];
  if (hasNativePanels(p)) files.push({ path: "scripts/generate-cards.mjs", content: generateCardScript(p) });

  if (user && p.addons.panels.length) {
    const colors = getTheme(p.addons.statsTheme).colors;
    const data = await fetchCardData(user);
    for (const c of resolveCards(user, p.addons.statsTheme, p.addons.panels)) {
      let svg: string;
      if (c.panel.id === "stats") svg = renderStatsCard(data.stats, colors);
      else if (c.panel.id === "topLangs") svg = renderTopLangsCard(data.langs, colors);
      else svg = renderPlaceholderCard(c.panel.label, colors);
      files.push({ path: `assets/${c.panel.file}`, content: svg });
    }
  }
  return files;
}
