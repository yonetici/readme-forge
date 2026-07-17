// Known-dead or fragile hosts seen in the wild in GitHub profile READMEs,
// with working replacements. Checked against the URL before any network call
// so the doctor can explain *why* a link is broken, not just that it is.

export interface ReplacementRule {
  /** Substring or pattern matched against the URL. */
  match: RegExp;
  reason: string;
  /** Rewrite the URL to a working equivalent, or null if there is no direct one. */
  rewrite: ((url: string) => string) | null;
}

export const REPLACEMENT_RULES: ReplacementRule[] = [
  {
    match: /github-readme-stats\.vercel\.app/,
    reason:
      "The shared github-readme-stats instance is chronically rate-limited (503). Use README Forge's durable-stats workflow, which renders stats inside your own repo.",
    rewrite: null,
  },
  {
    match: /github-readme-streak-stats\.herokuapp\.com/,
    reason: "Heroku free tier shut down in Nov 2022; streak-stats moved to demolab.com.",
    rewrite: (url) => url.replace("github-readme-streak-stats.herokuapp.com", "streak-stats.demolab.com"),
  },
  {
    match: /\.herokuapp\.com/,
    reason: "Heroku free dynos were discontinued in Nov 2022; most hobby apps are gone.",
    rewrite: null,
  },
  {
    match: /raw\.githubusercontent\.com\/devicons\/devicon\/master/,
    reason: "Icons on devicon master move or get renamed; pin a release via jsDelivr instead.",
    rewrite: (url) =>
      url.replace(
        "raw.githubusercontent.com/devicons/devicon/master",
        "cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0"
      ),
  },
  {
    match: /angular\.io\/assets/,
    reason: "angular.io was retired in favor of angular.dev; old asset paths 404.",
    rewrite: () =>
      "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/angularjs/angularjs-original.svg",
  },
  {
    match: /raw\.githubusercontent\.com\/rahuldkjain\/github-profile-readme-generator/,
    reason: "Hotlinked icons from a third-party repo break when that repo reorganizes.",
    rewrite: null,
  },
  {
    match: /www\.chartjs\.org\/media/,
    reason: "chartjs.org reorganized its site; old media paths 404.",
    rewrite: () => "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/chartjs/chartjs-original.svg",
  },
];

export function knownIssue(url: string) {
  const rule = REPLACEMENT_RULES.find((r) => r.match.test(url));
  if (!rule) return null;
  return { reason: rule.reason, suggestion: rule.rewrite ? rule.rewrite(url) : null };
}
