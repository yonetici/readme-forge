import { NextRequest, NextResponse } from "next/server";
import { knownIssue } from "@/lib/replacements";
import type { LinkReport } from "@/lib/types";

const MAX_URLS = 60;
const TIMEOUT_MS = 8000;

export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user")?.trim();
  if (!user || !/^[a-zA-Z0-9-]{1,39}$/.test(user)) {
    return NextResponse.json({ error: "Invalid GitHub username" }, { status: 400 });
  }

  const readme = await fetchProfileReadme(user);
  if (!readme) {
    return NextResponse.json(
      { error: `No profile README found for ${user} (repo ${user}/${user})` },
      { status: 404 }
    );
  }

  const urls = extractUrls(readme.content).slice(0, MAX_URLS);
  const reports = await Promise.all(urls.map((u) => checkUrl(u.url, u.isImage)));
  const broken = reports.filter((r) => !r.ok);

  return NextResponse.json({
    user,
    branch: readme.branch,
    totalLinks: urls.length,
    brokenCount: broken.length,
    reports,
  });
}

async function fetchProfileReadme(user: string) {
  for (const branch of ["main", "master"]) {
    const res = await fetch(
      `https://raw.githubusercontent.com/${user}/${user}/${branch}/README.md`,
      { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" }
    ).catch(() => null);
    if (res?.ok) return { content: await res.text(), branch };
  }
  return null;
}

interface FoundUrl {
  url: string;
  /** Used as an image in the README — a 200 that serves HTML is still broken. */
  isImage: boolean;
}

function extractUrls(markdown: string): FoundUrl[] {
  const found = new Map<string, boolean>();
  const add = (url: string, isImage: boolean) => {
    if (!url.startsWith("https://") && !url.startsWith("http://")) return;
    found.set(url, (found.get(url) ?? false) || isImage);
  };
  for (const m of markdown.matchAll(/src=["']([^"']+)["']/g)) add(m[1], true);
  for (const m of markdown.matchAll(/href=["']([^"']+)["']/g)) add(m[1], false);
  for (const m of markdown.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)) add(m[1], true);
  for (const m of markdown.matchAll(/(?<!!)\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)) add(m[1], false);

  return [...found.entries()]
    .filter(([url]) => {
      const host = new URL(url).hostname;
      return host !== "localhost" && !/^(\d{1,3}\.){3}\d{1,3}$/.test(host);
    })
    .map(([url, isImage]) => ({ url, isImage }));
}

// Sites behind bot protection answer 403/429/999 to automated checks while
// working fine for humans — report those as healthy to avoid false alarms.
const BOT_PROTECTED = new Set([403, 429, 999]);

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; readme-forge-link-doctor/1.0)",
  Accept: "*/*",
};

interface AttemptResult {
  status: number | null;
  contentType: string | null;
}

async function attempt(url: string, method: "HEAD" | "GET"): Promise<AttemptResult> {
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { status: res.status, contentType: res.headers.get("content-type") };
  } catch {
    return { status: null, contentType: null }; // DNS failure, timeout, connection refused
  }
}

async function checkUrl(url: string, isImage: boolean): Promise<LinkReport> {
  const known = knownIssue(url);
  let result = await attempt(url, "HEAD");
  // Some CDNs reject HEAD; others fail transiently on cold DNS — retry with GET.
  if (result.status === null || result.status === 405 || result.status === 403) {
    result = await attempt(url, "GET");
  }
  const { status, contentType } = result;

  const reachable = status !== null && (status < 400 || BOT_PROTECTED.has(status));
  // GitHub renders <img> only for image content types; an HTML page behind an
  // image URL is a soft-404 the status code alone would miss.
  const softBroken = reachable && isImage && contentType !== null && !contentType.startsWith("image/");
  const ok = reachable && !softBroken;

  let reason: string | null = null;
  if (!ok) {
    if (known?.reason) reason = known.reason;
    else if (softBroken) reason = `Used as an image but the server now returns ${contentType.split(";")[0]} — it will render as a broken image on GitHub.`;
    else if (status === null) reason = "Host unreachable (DNS failure or timeout).";
    else reason = `Returned HTTP ${status}.`;
  }

  return { url, status, ok, suggestion: known?.suggestion ?? null, reason };
}
