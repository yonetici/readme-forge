export interface FoundUrl {
  url: string;
  /** Used as an image in the README — a 200 that serves HTML is still broken. */
  isImage: boolean;
}

export function extractUrls(markdown: string): FoundUrl[] {
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

export async function fetchProfileReadme(user: string, timeoutMs = 8000) {
  for (const branch of ["main", "master"]) {
    const res = await fetch(
      `https://raw.githubusercontent.com/${user}/${user}/${branch}/README.md`,
      { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" }
    ).catch(() => null);
    if (res?.ok) return { content: await res.text(), branch };
  }
  return null;
}
