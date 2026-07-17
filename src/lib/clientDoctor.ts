// In-browser Link Doctor used on the static (GitHub Pages) build, where no
// server API exists. raw.githubusercontent.com allows CORS, so the README
// itself is fetchable; image URLs are verified by actually loading them
// (Image() fires onerror for 404s AND for HTML served where an image should
// be); plain links can't be probed cross-origin, so they are pattern-matched
// against known-dead services and otherwise reported as skipped.

import { extractUrls, fetchProfileReadme } from "./extract";
import { knownIssue } from "./replacements";
import type { LinkReport } from "./types";

const MAX_URLS = 60;
const TIMEOUT_MS = 8000;

export interface DoctorResult {
  user: string;
  branch: string;
  totalLinks: number;
  brokenCount: number;
  reports: LinkReport[];
}

export async function runClientDoctor(user: string): Promise<DoctorResult> {
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(user)) throw new Error("Invalid GitHub username");

  const readme = await fetchProfileReadme(user, TIMEOUT_MS);
  if (!readme) throw new Error(`No profile README found for ${user} (repo ${user}/${user})`);

  const urls = extractUrls(readme.content).slice(0, MAX_URLS);
  const reports = await Promise.all(
    urls.map(({ url, isImage }) => (isImage ? checkImage(url) : checkLink(url)))
  );

  return {
    user,
    branch: readme.branch,
    totalLinks: urls.length,
    brokenCount: reports.filter((r) => !r.ok && !r.skipped).length,
    reports,
  };
}

function checkImage(url: string): Promise<LinkReport> {
  const known = knownIssue(url);
  return new Promise((resolve) => {
    const img = new Image();
    const done = (ok: boolean, reason: string | null) => {
      img.src = "";
      resolve({ url, status: null, ok, suggestion: known?.suggestion ?? null, reason });
    };
    const timer = setTimeout(() => done(false, known?.reason ?? "Image did not load within 8s."), TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      done(true, null);
    };
    img.onerror = () => {
      clearTimeout(timer);
      done(false, known?.reason ?? "Image failed to load — the URL is dead or no longer serves an image.");
    };
    img.src = url;
  });
}

async function checkLink(url: string): Promise<LinkReport> {
  const known = knownIssue(url);
  if (known?.reason && known.suggestion) {
    // Pattern-matched to a known-dead service; no probe needed.
    return { url, status: null, ok: false, suggestion: known.suggestion, reason: known.reason };
  }
  // Cross-origin status codes are invisible to browsers; report as unverified.
  return { url, status: null, ok: true, skipped: true, suggestion: null, reason: null };
}
