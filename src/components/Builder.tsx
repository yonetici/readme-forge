"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { DEFAULT_PROFILE, type ProfileData, type StatsEngine } from "@/lib/types";
import {
  generateReadme,
  generateStatsWorkflow,
  generateCardScript,
  generateSetupDoc,
  hasNativePanels,
} from "@/lib/generator";
import { SKILL_CATEGORIES } from "@/data/skills";
import { SOCIAL_PLATFORMS } from "@/data/socials";
import { STATS_THEMES, getTheme } from "@/data/statsThemes";
import { STATS_PANELS, resolveCards, type PanelId } from "@/lib/statsCards";
import { renderStatsCard, renderTopLangsCard, renderPlaceholderCard } from "@/lib/cardRenderer";
import { fetchCardData } from "@/lib/githubData";
import { createZip, type ZipEntry } from "@/lib/zip";
import { Doctor } from "./Doctor";

type Tab = "builder" | "doctor";
type OutputTab = "preview" | "markdown" | "workflow";

export function Builder() {
  const [tab, setTab] = useState<Tab>("builder");
  const [outputTab, setOutputTab] = useState<OutputTab>("preview");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => generateReadme(profile), [profile]);
  const previewMarkdown = useMemo(() => generateReadme(profile, { forPreview: true }), [profile]);
  const workflow = useMemo(() => generateStatsWorkflow(profile), [profile]);
  const cardScript = useMemo(() => generateCardScript(profile), [profile]);
  const durable = profile.addons.statsEngine === "durable";
  const shipScript = durable && hasNativePanels(profile);
  // The workflow tab only exists in durable mode; fall back if the user
  // switched engines while it was selected.
  const activeTab = outputTab === "workflow" && !durable ? "preview" : outputTab;

  const set = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const setAddon = <K extends keyof ProfileData["addons"]>(key: K, value: ProfileData["addons"][K]) =>
    setProfile((p) => ({ ...p, addons: { ...p.addons, [key]: value } }));

  const togglePanel = (id: PanelId) =>
    setProfile((p) => ({
      ...p,
      addons: {
        ...p.addons,
        panels: p.addons.panels.includes(id)
          ? p.addons.panels.filter((x) => x !== id)
          : [...p.addons.panels, id],
      },
    }));

  const toggleSkill = (id: string) =>
    setProfile((p) => ({
      ...p,
      skills: p.skills.includes(id) ? p.skills.filter((s) => s !== id) : [...p.skills, id],
    }));

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const saveBlob = (filename: string, blob: Blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const download = (filename: string, content: string) =>
    saveBlob(filename, new Blob([content], { type: "text/plain" }));

  const [bundling, setBundling] = useState(false);

  // Durable mode ships a ready-to-commit archive: correct folder layout plus
  // pre-rendered asset SVGs, so the README works the instant it's committed —
  // before the workflow has ever run.
  const downloadBundle = async () => {
    const user = profile.githubUsername.trim();
    const entries: ZipEntry[] = [
      { path: "README.md", content: markdown },
      { path: "SETUP.md", content: generateSetupDoc(profile) },
      { path: ".github/workflows/update-stats.yml", content: workflow },
    ];
    if (shipScript) entries.push({ path: "scripts/generate-cards.mjs", content: cardScript });

    if (user && profile.addons.panels.length) {
      setBundling(true);
      try {
        const colors = getTheme(profile.addons.statsTheme).colors;
        const data = await fetchCardData(user);
        for (const c of resolveCards(user, profile.addons.statsTheme, profile.addons.panels)) {
          let svg: string;
          if (c.panel.id === "stats") svg = renderStatsCard(data.stats, colors);
          else if (c.panel.id === "topLangs") svg = renderTopLangsCard(data.langs, colors);
          else svg = renderPlaceholderCard(c.panel.label, colors);
          entries.push({ path: `assets/${c.panel.file}`, content: svg });
        }
      } finally {
        setBundling(false);
      }
    }
    saveBlob("readme-forge-profile.zip", createZip(entries));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      <div className="mb-6 flex gap-2">
        <TabButton active={tab === "builder"} onClick={() => setTab("builder")}>
          🛠️ Builder
        </TabButton>
        <TabButton active={tab === "doctor"} onClick={() => setTab("doctor")}>
          🩺 Link Doctor
        </TabButton>
      </div>

      {tab === "doctor" ? (
        <Doctor />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ----- form ----- */}
          <div className="space-y-6">
            <Section title="Basics">
              <Field label="Name" value={profile.name} onChange={(v) => set("name", v)} placeholder="Ada Lovelace" />
              <Field label="Tagline" value={profile.tagline} onChange={(v) => set("tagline", v)} placeholder="Building things that outlive their dependencies" />
              <Field label="GitHub username" value={profile.githubUsername} onChange={(v) => set("githubUsername", v)} placeholder="octocat" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Currently working on" value={profile.currentWork} onChange={(v) => set("currentWork", v)} placeholder="Project name" />
                <Field label="Project link (optional)" value={profile.currentWorkLink} onChange={(v) => set("currentWorkLink", v)} placeholder="https://…" />
              </div>
              <Field label="Currently learning" value={profile.learning} onChange={(v) => set("learning", v)} placeholder="Rust, WebGPU" />
              <Field label="Ask me about" value={profile.askMeAbout} onChange={(v) => set("askMeAbout", v)} placeholder="Python, databases, SEO" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" value={profile.email} onChange={(v) => set("email", v)} placeholder="you@example.com" />
                <Field label="Portfolio" value={profile.portfolio} onChange={(v) => set("portfolio", v)} placeholder="https://…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Blog" value={profile.blog} onChange={(v) => set("blog", v)} placeholder="https://…" />
                <Field label="Fun fact" value={profile.funFact} onChange={(v) => set("funFact", v)} placeholder="I debug in my dreams" />
              </div>
            </Section>

            <Section title="Skills" hint={`${profile.skills.length} selected — icons are version-pinned via jsDelivr, so they never 404`}>
              <div className="space-y-4">
                {SKILL_CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{cat.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((s) => {
                        const active = profile.skills.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSkill(s.id)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition ${
                              active
                                ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.iconUrl} alt="" width={16} height={16} />
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Social">
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_PLATFORMS.map((s) => (
                  <Field
                    key={s.id}
                    label={s.label}
                    value={profile.socials[s.id] ?? ""}
                    onChange={(v) => set("socials", { ...profile.socials, [s.id]: v })}
                    placeholder={s.placeholder}
                  />
                ))}
              </div>
            </Section>

            <Section title="GitHub Stats" hint="Pick the panels, a theme, and how they’re delivered. The preview shows live cards; the download wires up whichever delivery you choose.">
              <div>
                <p className="mb-1.5 text-xs text-zinc-400">Delivery</p>
                <div className="grid grid-cols-2 gap-2">
                  <EngineOption
                    active={durable}
                    onClick={() => setAddon("statsEngine", "durable" as StatsEngine)}
                    title="Durable"
                    badge="recommended"
                    desc="Cards fetched daily & committed to your repo. Survives outages, no per-view rate limits."
                  />
                  <EngineOption
                    active={!durable}
                    onClick={() => setAddon("statsEngine", "live" as StatsEngine)}
                    title="Live"
                    desc="Hotlink the shared services directly. Instant, but can rate-limit or 503."
                  />
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs text-zinc-400">Theme</span>
                <select
                  value={profile.addons.statsTheme}
                  onChange={(e) => setAddon("statsTheme", e.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-500"
                >
                  {STATS_THEMES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <p className="mb-2 text-xs text-zinc-400">Panels</p>
                <div className="space-y-2">
                  {STATS_PANELS.map((panel) => (
                    <Toggle
                      key={panel.id}
                      label={panel.label}
                      hint={panel.hint}
                      checked={profile.addons.panels.includes(panel.id)}
                      onChange={() => togglePanel(panel.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3">
                <Toggle
                  label="Visitor count badge"
                  checked={profile.addons.visitorBadge}
                  onChange={(v) => setAddon("visitorBadge", v)}
                />
              </div>
            </Section>
          </div>

          {/* ----- output ----- */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
                <div className="flex gap-1">
                  <OutputTabButton active={activeTab === "preview"} onClick={() => setOutputTab("preview")}>Preview</OutputTabButton>
                  <OutputTabButton active={activeTab === "markdown"} onClick={() => setOutputTab("markdown")}>Markdown</OutputTabButton>
                  {durable && (
                    <OutputTabButton active={activeTab === "workflow"} onClick={() => setOutputTab("workflow")}>Workflow</OutputTabButton>
                  )}
                </div>
                <div className="flex gap-2">
                  {activeTab === "preview" && (
                    <button
                      type="button"
                      onClick={() => setPreviewTheme((t) => (t === "light" ? "dark" : "light"))}
                      title={`Previewing GitHub ${previewTheme} theme — click to switch`}
                      className="rounded-md bg-zinc-800 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
                    >
                      {previewTheme === "light" ? "☀️ Light" : "🌙 Dark"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => copy(activeTab === "workflow" ? workflow : markdown)}
                    className="rounded-md bg-zinc-800 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                  <button
                    type="button"
                    disabled={bundling}
                    onClick={() => (durable ? downloadBundle() : download("README.md", markdown))}
                    className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {bundling ? "Bundling…" : durable ? "Download .zip" : "Download README"}
                  </button>
                </div>
              </div>
              <div className="max-h-[80vh] overflow-auto p-4">
                {activeTab === "preview" && (
                  <div className={`readme-preview gh-${previewTheme}`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      urlTransform={(url) => url}
                      components={{
                        img: (props) => (
                          <PreviewImg
                            src={props.src?.toString() ?? ""}
                            alt={props.alt ?? ""}
                            width={props.width}
                            height={props.height}
                            user={profile.githubUsername.trim()}
                            theme={profile.addons.statsTheme}
                          />
                        ),
                      }}
                    >
                      {previewMarkdown}
                    </ReactMarkdown>
                  </div>
                )}
                {activeTab === "markdown" && (
                  <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-300">{markdown}</pre>
                )}
                {activeTab === "workflow" && (
                  <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-300">{workflow}</pre>
                )}
              </div>
            </div>
            {durable ? (
              <div className="mt-2 space-y-1 text-xs text-zinc-500">
                <p>
                  <strong className="text-zinc-400">Don&apos;t just copy-paste this one.</strong> The stat cards use
                  relative paths like <code>./assets/github-stats.svg</code>, so they only work once those files exist
                  in your repo.
                </p>
                <p>
                  <strong className="text-emerald-400">Download .zip</strong> gives you a ready-to-commit folder —
                  <code>README.md</code>, the workflow{shipScript && <> and <code>generate-cards.mjs</code></>}, plus
                  the <code>assets/</code> cards <em>already rendered</em>, so your profile works the moment you commit
                  (before the workflow even runs). See the included <code>SETUP.md</code>. Prefer plain copy-paste?
                  Switch to <strong>Live</strong>.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-zinc-500">
                Live mode hotlinks the shared services on every view — quick to set up, but they can rate-limit or
                go down. Switch to <strong>Durable</strong> to commit the cards to your repo instead.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewImg({
  src,
  alt,
  width,
  height,
  user,
  theme,
}: {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  user: string;
  theme: string;
}) {
  const [failed, setFailed] = useState(false);
  // Native cards point at ./assets/*.svg — render README Forge's own card from
  // live GitHub data instead of a third-party image.
  if (src === "./assets/github-stats.svg") return <NativeCard kind="stats" user={user} theme={theme} />;
  if (src === "./assets/top-langs.svg") return <NativeCard kind="langs" user={user} theme={theme} />;
  if (failed) {
    // A card that won't load right now (e.g. the shared stats service is 503)
    // — show why, which is exactly the case durable mode fixes.
    return (
      <span className="my-1 inline-block rounded-lg border border-dashed border-amber-700/60 bg-amber-950/20 px-3 py-4 text-center text-xs text-amber-300/80">
        ⚠️ “{alt}” didn’t load — the live service may be rate-limited or down. Durable mode serves a committed
        copy so this doesn’t reach your visitors.
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} onError={() => setFailed(true)} />
  );
}

function NativeCard({ kind, user, theme }: { kind: "stats" | "langs"; user: string; theme: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [sample, setSample] = useState(false);

  useEffect(() => {
    let live = true;
    if (!user) return;
    fetchCardData(user).then((data) => {
      if (!live) return;
      const colors = getTheme(theme).colors;
      setSample(data.sample);
      setSvg(kind === "stats" ? renderStatsCard(data.stats, colors) : renderTopLangsCard(data.langs, colors));
    });
    return () => {
      live = false;
    };
  }, [kind, user, theme]);

  if (!user) {
    return (
      <span className="my-1 inline-block rounded-lg border border-dashed border-zinc-600 bg-zinc-900 px-3 py-4 text-center text-xs text-zinc-400">
        Enter a GitHub username to preview your {kind === "stats" ? "stats" : "languages"} card.
      </span>
    );
  }
  if (!svg) {
    return (
      <span className="my-1 inline-block rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-4 text-center text-xs text-zinc-500">
        Rendering your {kind === "stats" ? "stats" : "languages"} card…
      </span>
    );
  }
  return (
    <span className="my-1 inline-block max-w-full align-top">
      <span className="block max-w-[420px] [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      {sample && (
        <span className="mt-0.5 block text-[10px] text-zinc-500">
          sample numbers (GitHub API rate-limited in preview) — the workflow uses your real data
        </span>
      )}
    </span>
  );
}

function EngineOption({
  active,
  onClick,
  title,
  desc,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition ${
        active ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span className={`text-sm font-medium ${active ? "text-emerald-300" : "text-zinc-200"}`}>{title}</span>
        {badge && <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">{badge}</span>}
      </span>
      <span className="mt-1 block text-[11px] leading-snug text-zinc-500">{desc}</span>
    </button>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <h2 className="mb-1 text-sm font-semibold text-zinc-100">{title}</h2>
      {hint && <p className="mb-3 text-xs text-zinc-500">{hint}</p>}
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-zinc-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500"
      />
    </label>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-500" />
      <span>
        <span className="block text-sm text-zinc-200">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
    </label>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

function OutputTabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-xs ${active ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
    >
      {children}
    </button>
  );
}
