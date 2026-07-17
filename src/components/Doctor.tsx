"use client";

import { useState } from "react";
import type { LinkReport } from "@/lib/types";

interface DoctorResult {
  user: string;
  branch: string;
  totalLinks: number;
  brokenCount: number;
  reports: LinkReport[];
}

export function Doctor() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DoctorResult | null>(null);

  const run = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/doctor?user=${encodeURIComponent(username.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const broken = result?.reports.filter((r) => !r.ok) ?? [];
  const healthy = result?.reports.filter((r) => r.ok) ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">Link Doctor</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Checks every link and image in an existing profile README, explains why the dead ones died, and suggests
          working replacements.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="GitHub username"
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Diagnose"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="flex gap-4 text-sm">
            <span className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-300">
              {result.totalLinks} links checked
            </span>
            <span
              className={`rounded-lg border px-4 py-2 ${
                result.brokenCount > 0
                  ? "border-red-900 bg-red-950/50 text-red-300"
                  : "border-emerald-900 bg-emerald-950/50 text-emerald-300"
              }`}
            >
              {result.brokenCount > 0 ? `${result.brokenCount} broken` : "All healthy 🎉"}
            </span>
          </div>

          {broken.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-red-300">Broken links</h3>
              {broken.map((r) => (
                <ReportCard key={r.url} report={r} />
              ))}
            </div>
          )}

          {healthy.length > 0 && (
            <details className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <summary className="cursor-pointer text-sm text-zinc-400">
                {healthy.length} healthy links
              </summary>
              <ul className="mt-3 space-y-1">
                {healthy.map((r) => (
                  <li key={r.url} className="truncate text-xs text-zinc-500">
                    <span className="text-emerald-500">✓</span> {r.url}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: LinkReport }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-red-900/50 bg-zinc-950 p-4">
      <p className="break-all font-mono text-xs text-zinc-300">{report.url}</p>
      <p className="mt-2 text-xs text-red-300">
        {report.status === null ? "✗ Unreachable" : `✗ HTTP ${report.status}`}
        {report.reason && <span className="text-zinc-400"> — {report.reason}</span>}
      </p>
      {report.suggestion && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-lg border border-emerald-900/50 bg-emerald-950/30 p-3">
          <div>
            <p className="text-xs font-medium text-emerald-300">Suggested replacement</p>
            <p className="mt-1 break-all font-mono text-xs text-zinc-300">{report.suggestion}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(report.suggestion!);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="shrink-0 rounded-md bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500"
          >
            {copied ? "✓" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
