import type { ZipEntry } from "./zip";

// Commits a set of files to the user's profile repo (login/login) in a single
// commit, straight from the browser via the GitHub REST API (which is
// CORS-enabled). The token stays in memory in the user's own tab and is only
// ever sent to api.github.com — README Forge has no backend and never sees it.

const API = "https://api.github.com";

export interface PublishResult {
  repoUrl: string;
  commitUrl: string;
  createdRepo: boolean;
}

export class PublishError extends Error {}

export async function publishToGitHub(token: string, files: ZipEntry[]): Promise<PublishResult> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const api = async (path: string, init?: RequestInit) => {
    const res = await fetch(`${API}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new PublishError(explain(res.status, body.message, path));
    }
    return res.json();
  };

  // 1. Confirm the token and learn which account it belongs to.
  const me = await api("/user");
  const owner: string = me.login;

  // 2. Ensure the profile repo exists (create it, seeded, if missing).
  let createdRepo = false;
  let repo = await tryGet(`${API}/repos/${owner}/${owner}`, headers);
  if (!repo) {
    repo = await api("/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: owner,
        description: "Profile README, forged with README Forge",
        auto_init: true, // gives us an initial commit to build on
        private: false,
      }),
    });
    createdRepo = true;
    // auto_init is async; wait for the default branch to have a commit.
    await waitForBranch(`${API}/repos/${owner}/${owner}/git/ref/heads/${repo.default_branch}`, headers);
  }

  const branch: string = repo.default_branch;

  // 3. Base commit + tree.
  const ref = await api(`/repos/${owner}/${owner}/git/ref/heads/${branch}`);
  const baseCommitSha: string = ref.object.sha;
  const baseCommit = await api(`/repos/${owner}/${owner}/git/commits/${baseCommitSha}`);

  // 4. One blob per file.
  const treeItems = await Promise.all(
    files.map(async (f) => {
      const blob = await api(`/repos/${owner}/${owner}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
      });
      return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
    })
  );

  // 5. Tree → commit → move the branch to it.
  const tree = await api(`/repos/${owner}/${owner}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: treeItems }),
  });
  const commit = await api(`/repos/${owner}/${owner}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: "Update profile README (README Forge)",
      tree: tree.sha,
      parents: [baseCommitSha],
    }),
  });
  await api(`/repos/${owner}/${owner}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });

  return { repoUrl: repo.html_url, commitUrl: commit.html_url, createdRepo };
}

async function tryGet(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new PublishError(explain(res.status, (await res.json().catch(() => ({}))).message, url));
  return res.json();
}

async function waitForBranch(url: string, headers: Record<string, string>) {
  for (let i = 0; i < 10; i++) {
    const res = await fetch(url, { headers });
    if (res.ok) return;
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new PublishError("The new repository didn't initialize in time — try Publish again.");
}

function explain(status: number, message: string | undefined, path: string): string {
  if (status === 401) return "That token was rejected. Create a fresh fine-grained token and try again.";
  if (status === 403 || status === 404) {
    if (path.includes("/git/") || path.includes("/repos/"))
      return "The token can't write to your profile repo. Give it Repository access → your profile repo, with Contents: Read and write.";
  }
  if (status === 422 && path === "/user/repos") return "Couldn't create the repo (it may already exist under a different case).";
  return `GitHub API error ${status}${message ? `: ${message}` : ""}.`;
}
