"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { DEFAULT_PROFILE, type ProfileData } from "@/lib/types";
import { generateReadme, generateStatsWorkflow } from "@/lib/generator";
import { SKILL_CATEGORIES } from "@/data/skills";
import { SOCIAL_PLATFORMS } from "@/data/socials";
import { Doctor } from "./Doctor";

type Tab = "builder" | "doctor";
type OutputTab = "preview" | "markdown" | "workflow";

export function Builder() {
  const [tab, setTab] = useState<Tab>("builder");
  const [outputTab, setOutputTab] = useState<OutputTab>("preview");
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => generateReadme(profile), [profile]);
  const workflow = useMemo(() => generateStatsWorkflow(profile), [profile]);

  const set = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

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

  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
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

            <Section title="Stats & add-ons">
              <Toggle
                label="Durable stats (recommended)"
                hint="Ships a GitHub Actions workflow that renders stats to a committed SVG — immune to rate limits and dead services"
                checked={profile.addons.staticStatsWorkflow}
                onChange={(v) => set("addons", { ...profile.addons, staticStatsWorkflow: v })}
              />
              <Toggle label="Visitor count badge" checked={profile.addons.visitorBadge} onChange={(v) => set("addons", { ...profile.addons, visitorBadge: v })} />
              {!profile.addons.staticStatsWorkflow && (
                <>
                  <Toggle label="GitHub stats card" checked={profile.addons.githubStats} onChange={(v) => set("addons", { ...profile.addons, githubStats: v })} />
                  <Toggle label="Top languages card" checked={profile.addons.topLangs} onChange={(v) => set("addons", { ...profile.addons, topLangs: v })} />
                  <Toggle label="Streak card" checked={profile.addons.streak} onChange={(v) => set("addons", { ...profile.addons, streak: v })} />
                  <Toggle label="Trophies" checked={profile.addons.trophies} onChange={(v) => set("addons", { ...profile.addons, trophies: v })} />
                </>
              )}
            </Section>
          </div>

          {/* ----- output ----- */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
                <div className="flex gap-1">
                  <OutputTabButton active={outputTab === "preview"} onClick={() => setOutputTab("preview")}>Preview</OutputTabButton>
                  <OutputTabButton active={outputTab === "markdown"} onClick={() => setOutputTab("markdown")}>Markdown</OutputTabButton>
                  {profile.addons.staticStatsWorkflow && (
                    <OutputTabButton active={outputTab === "workflow"} onClick={() => setOutputTab("workflow")}>Workflow</OutputTabButton>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copy(outputTab === "workflow" ? workflow : markdown)}
                    className="rounded-md bg-zinc-800 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      download("README.md", markdown);
                      if (profile.addons.staticStatsWorkflow) download("update-stats.yml", workflow);
                    }}
                    className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                  >
                    Download
                  </button>
                </div>
              </div>
              <div className="max-h-[80vh] overflow-auto p-4">
                {outputTab === "preview" && (
                  <div className="readme-preview">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      urlTransform={(url) => url}
                      components={{
                        img: (props) =>
                          props.src?.toString().startsWith("./") ? (
                            <span className="my-2 block rounded-lg border border-dashed border-zinc-600 bg-zinc-900 px-4 py-6 text-center text-xs text-zinc-400">
                              📊 <code>{props.src.toString()}</code> — rendered inside your repo by the included
                              Actions workflow after its first run
                            </span>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img {...props} alt={props.alt ?? ""} />
                          ),
                      }}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </div>
                )}
                {outputTab === "markdown" && (
                  <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-300">{markdown}</pre>
                )}
                {outputTab === "workflow" && (
                  <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-300">{workflow}</pre>
                )}
              </div>
            </div>
            {profile.addons.staticStatsWorkflow && (
              <p className="mt-2 text-xs text-zinc-500">
                Download gives you <code>README.md</code> + <code>update-stats.yml</code>. Put the workflow at{" "}
                <code>.github/workflows/update-stats.yml</code> in your profile repo and run it once from the Actions tab.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
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
